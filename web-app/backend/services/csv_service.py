"""
CSV Data Service for loading and processing expense data from CSV files
"""

import pandas as pd
import os
from typing import List, Dict, Any, Optional
from datetime import datetime
import csv
from models.transaction import Transaction, TransactionCategory, TransactionType

class CSVService:
    """Service for loading and processing expense data from CSV files"""
    
    def __init__(self, data_directory: str = "../data"):  # Look in parent directory
        self.data_directory = data_directory
        self.csv_file_path = os.path.join(data_directory, "transactions.csv")
        self.ensure_data_directory()
    
    def ensure_data_directory(self):
        """Ensure the data directory exists"""
        if not os.path.exists(self.data_directory):
            os.makedirs(self.data_directory)
    
    def load_transactions_from_csv(self, file_path: Optional[str] = None) -> List[Transaction]:
        """Load transactions from CSV file"""
        csv_path = file_path or self.csv_file_path
        
        if not os.path.exists(csv_path):
            print(f"CSV file not found at {csv_path}")
            return []
        
        try:
            df = pd.read_csv(csv_path)
            transactions = []
            
            for _, row in df.iterrows():
                try:
                    transaction = self._parse_csv_row(row)
                    if transaction:
                        transactions.append(transaction)
                except Exception as e:
                    print(f"Error parsing row {row.to_dict()}: {e}")
                    continue
            
            print(f"Successfully loaded {len(transactions)} transactions from CSV")
            return transactions
            
        except Exception as e:
            print(f"Error loading CSV file: {e}")
            return []
    
    def _parse_csv_row(self, row: pd.Series) -> Optional[Transaction]:
        """Parse a single CSV row into a Transaction object"""
        try:
            # Handle different possible column names for your actual data format
            amount = self._safe_float(row.get('amount', 0))
            description = str(row.get('name', row.get('description', row.get('Description', ''))))
            category = str(row.get('category', row.get('Category', 'other')))
            parent_category = str(row.get('parent category', row.get('parent_category', '')))
            date_str = str(row.get('date', row.get('Date', '')))
            merchant = str(row.get('name', row.get('merchant', row.get('Merchant', ''))))
            tags_str = str(row.get('tags', row.get('Tags', '')))
            excluded = row.get('excluded', False)
            status = str(row.get('status', ''))
            note = str(row.get('note', row.get('notes', row.get('Notes', ''))))
            transaction_type_str = str(row.get('type', 'regular'))
            account = str(row.get('account', ''))
            account_mask = str(row.get('account mask', ''))
            recurring = str(row.get('recurring', ''))
            
            # Parse date
            date = self._parse_date(date_str)
            
            # Parse tags
            tags = self._parse_tags(tags_str)
            
            # Generate ID if not present
            transaction_id = str(row.get('id', row.get('ID', f"{date.strftime('%Y%m%d')}_{hash(description)}")))
            
            # Map category to original data categories
            clean_category = self._map_to_mba_category(category, description, parent_category)
            
            # Add status and other metadata to tags
            if status and status != 'nan':
                tags.append(f"status:{status.lower()}")
            
            # Map transaction type from CSV to our enum
            if transaction_type_str == 'regular':
                transaction_type = TransactionType.REGULAR
            elif transaction_type_str == 'internal transfer':
                transaction_type = TransactionType.INTERNAL_TRANSFER
            elif transaction_type_str == 'income':
                transaction_type = TransactionType.INCOME
            else:
                transaction_type = TransactionType.REGULAR  # Default fallback
            
            return Transaction(
                id=transaction_id,
                amount=amount,  # Keep original amount (positive or negative)
                description=description,
                category=clean_category,
                parent_category=parent_category if parent_category != 'nan' else None,
                date=date,
                merchant=merchant if merchant != 'nan' else None,
                account=account if account != 'nan' else None,
                account_mask=account_mask if account_mask != 'nan' else None,
                tags=tags,
                notes=note if note != 'nan' else None,
                transaction_type=transaction_type,
                status=status if status != 'nan' else None,
                excluded=excluded,
                recurring=recurring if recurring != 'nan' else None,
                source="csv"
            )
            
        except Exception as e:
            print(f"Error parsing CSV row: {e}")
            return None
    
    def _safe_float(self, value: Any) -> float:
        """Safely convert value to float"""
        try:
            if pd.isna(value) or value == '':
                return 0.0
            # Remove currency symbols and commas
            if isinstance(value, str):
                value = value.replace('$', '').replace(',', '').strip()
            return float(value)
        except (ValueError, TypeError):
            return 0.0
    
    def _parse_date(self, date_str: str) -> datetime:
        """Parse date string into datetime object"""
        if not date_str or date_str == '' or pd.isna(date_str):
            return datetime.now()
        
        # Try different date formats
        date_formats = [
            '%Y-%m-%d',
            '%m/%d/%Y',
            '%d/%m/%Y',
            '%Y-%m-%d %H:%M:%S',
            '%m/%d/%Y %H:%M:%S',
            '%d/%m/%Y %H:%M:%S'
        ]
        
        for fmt in date_formats:
            try:
                return datetime.strptime(str(date_str).strip(), fmt)
            except ValueError:
                continue
        
        # If no format works, return current date
        print(f"Could not parse date: {date_str}, using current date")
        return datetime.now()
    
    def _parse_tags(self, tags_str: str) -> List[str]:
        """Parse tags string into list of tags"""
        if not tags_str or tags_str == '' or pd.isna(tags_str):
            return []
        
        # Split by common delimiters
        tags = []
        for delimiter in [',', ';', '|']:
            if delimiter in tags_str:
                tags = [tag.strip().lower() for tag in tags_str.split(delimiter) if tag.strip()]
                break
        
        if not tags:
            tags = [tags_str.strip().lower()]
        
        return tags
    
    def _map_to_mba_category(self, original_category: str, description: str, parent_category: str = "") -> str:
        """Use original category from data, with minimal cleaning"""
        if not original_category or original_category == '' or original_category.lower() == 'nan':
            return self._infer_category_from_description(description)
        
        # Clean up the category name but keep it as-is
        category_clean = original_category.lower().strip()
        
        # Only do minimal mapping for very common cases
        if category_clean in ['', 'nan', 'null', 'none']:
            return self._infer_category_from_description(description)
        
        # Return the original category as-is (will be converted to valid enum value)
        return category_clean
    
    def _infer_category_from_description(self, description: str) -> str:
        """Infer category from description when original category is unclear"""
        if not description:
            return 'other'
        
        description_lower = description.lower()
        
        # Tuition keywords
        if any(word in description_lower for word in ['tuition', 'fee', 'semester', 'course', 'credit']):
            return 'tuition'
        
        # Books keywords
        if any(word in description_lower for word in ['book', 'textbook', 'case', 'study', 'material']):
            return 'books_supplies'
        
        # Housing keywords
        if any(word in description_lower for word in ['rent', 'apartment', 'housing', 'utility', 'electric', 'water']):
            return 'housing'
        
        # Food keywords
        if any(word in description_lower for word in ['food', 'restaurant', 'grocery', 'dining', 'coffee', 'lunch', 'dinner']):
            return 'food'
        
        # Transportation keywords
        if any(word in description_lower for word in ['gas', 'fuel', 'uber', 'lyft', 'metro', 'bus', 'parking']):
            return 'transportation'
        
        # Networking keywords
        if any(word in description_lower for word in ['networking', 'conference', 'event', 'club', 'meeting', 'professional']):
            return 'networking'
        
        # Entertainment keywords
        if any(word in description_lower for word in ['movie', 'entertainment', 'game', 'sport', 'recreation']):
            return 'entertainment'
        
        # Health keywords
        if any(word in description_lower for word in ['health', 'medical', 'doctor', 'gym', 'fitness', 'wellness']):
            return 'health'
        
        # Technology keywords
        if any(word in description_lower for word in ['software', 'hardware', 'computer', 'tech', 'app', 'subscription']):
            return 'technology'
        
        # Travel keywords
        if any(word in description_lower for word in ['travel', 'flight', 'hotel', 'trip', 'vacation']):
            return 'travel'
        
        return 'other'
    
    def create_sample_csv(self, file_path: Optional[str] = None) -> str:
        """Create a sample CSV file with the expected format"""
        csv_path = file_path or self.csv_file_path
        
        sample_data = [
            {
                'date': '2024-08-15',
                'amount': 1500.00,
                'description': 'Fall 2024 Tuition',
                'category': 'tuition',
                'merchant': 'University',
                'tags': 'tuition,fall2024',
                'notes': 'First semester tuition payment'
            },
            {
                'date': '2024-08-20',
                'amount': 89.99,
                'description': 'Strategic Management Textbook',
                'category': 'books',
                'merchant': 'University Bookstore',
                'tags': 'textbook,strategy',
                'notes': 'Required textbook for Strategy class'
            },
            {
                'date': '2024-09-05',
                'amount': 45.00,
                'description': 'Networking Event - Finance Club',
                'category': 'networking',
                'merchant': 'Finance Club',
                'tags': 'networking,finance',
                'notes': 'Monthly networking mixer'
            },
            {
                'date': '2024-09-10',
                'amount': 25.50,
                'description': 'Lunch with study group',
                'category': 'food',
                'merchant': 'Campus Cafe',
                'tags': 'food,study',
                'notes': 'Group study lunch'
            },
            {
                'date': '2024-09-15',
                'amount': 120.00,
                'description': 'Monthly rent payment',
                'category': 'housing',
                'merchant': 'Apartment Complex',
                'tags': 'rent,housing',
                'notes': 'September rent'
            }
        ]
        
        try:
            with open(csv_path, 'w', newline='', encoding='utf-8') as csvfile:
                fieldnames = ['date', 'amount', 'description', 'category', 'merchant', 'tags', 'notes']
                writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
                writer.writeheader()
                writer.writerows(sample_data)
            
            print(f"Sample CSV file created at {csv_path}")
            return csv_path
            
        except Exception as e:
            print(f"Error creating sample CSV: {e}")
            return ""
    
    def validate_csv_format(self, file_path: str) -> Dict[str, Any]:
        """Validate CSV file format and return validation results"""
        try:
            df = pd.read_csv(file_path)
            
            # Check for required columns
            required_columns = ['date', 'amount', 'description']
            missing_columns = [col for col in required_columns if col not in df.columns]
            
            # Check for optional columns
            optional_columns = ['category', 'merchant', 'tags', 'notes']
            present_optional = [col for col in optional_columns if col in df.columns]
            
            # Check data types and validity
            validation_errors = []
            
            if 'amount' in df.columns:
                try:
                    pd.to_numeric(df['amount'], errors='coerce')
                except:
                    validation_errors.append("Amount column contains non-numeric values")
            
            if 'date' in df.columns:
                try:
                    pd.to_datetime(df['date'], errors='coerce')
                except:
                    validation_errors.append("Date column contains invalid date formats")
            
            return {
                'valid': len(missing_columns) == 0 and len(validation_errors) == 0,
                'missing_columns': missing_columns,
                'present_optional_columns': present_optional,
                'validation_errors': validation_errors,
                'row_count': len(df),
                'columns': list(df.columns)
            }
            
        except Exception as e:
            return {
                'valid': False,
                'error': str(e),
                'missing_columns': [],
                'present_optional_columns': [],
                'validation_errors': [str(e)],
                'row_count': 0,
                'columns': []
            }
