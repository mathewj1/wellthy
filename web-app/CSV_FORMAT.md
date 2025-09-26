# CSV Data Format for MBA Expense Explorer

This document describes the expected CSV format for uploading expense data to the MBA Expense Explorer.

## Required Columns

| Column | Description | Example | Notes |
|--------|-------------|---------|-------|
| `date` | Transaction date | `2024-08-15` | Supports multiple formats (YYYY-MM-DD, MM/DD/YYYY, etc.) |
| `amount` | Transaction amount | `1500.00` | Can include currency symbols ($1500.00) |
| `description` | Transaction description | `Fall 2024 Tuition` | Free text description |

## Optional Columns

| Column | Description | Example | Notes |
|--------|-------------|---------|-------|
| `category` | Expense category | `tuition` | Will be mapped to MBA categories |
| `merchant` | Merchant name | `University` | Store or vendor name |
| `tags` | Comma-separated tags | `tuition,fall2024` | Help with categorization |
| `notes` | Additional notes | `First semester payment` | Extra context |

## MBA Category Mapping

The system automatically maps your categories to MBA-specific categories:

### Automatic Mappings
- `tuition`, `fees`, `academic` → **Tuition & Fees**
- `books`, `textbook`, `supplies` → **Books & Supplies**
- `rent`, `housing`, `utilities` → **Housing**
- `food`, `groceries`, `restaurant`, `dining` → **Food & Dining**
- `transportation`, `gas`, `uber`, `lyft` → **Transportation**
- `networking`, `conference`, `event` → **Networking**
- `entertainment`, `movie`, `game` → **Entertainment**
- `health`, `medical`, `gym` → **Health & Wellness**
- `technology`, `software`, `hardware` → **Technology**
- `travel`, `flight`, `hotel` → **Travel**
- `other` or unmapped → **Other**

### Smart Category Detection
If no category is provided, the system will analyze the description to automatically assign a category.

## Sample CSV File

```csv
date,amount,description,category,merchant,tags,notes
2024-08-15,1500.00,Fall 2024 Tuition,tuition,University,"tuition,fall2024",First semester tuition payment
2024-08-20,89.99,Strategic Management Textbook,books,University Bookstore,"textbook,strategy",Required textbook for Strategy class
2024-09-05,45.00,Networking Event - Finance Club,networking,Finance Club,"networking,finance",Monthly networking mixer
2024-09-10,25.50,Lunch with study group,food,Campus Cafe,"food,study",Group study lunch
2024-09-15,1200.00,Monthly rent payment,housing,Apartment Complex,"rent,housing",September rent
2024-09-20,15.00,Uber to campus,transportation,Uber,"transportation,uber",Ride to morning class
2024-09-25,75.00,Case study materials,books,Online Store,"books,case",Digital case studies
2024-10-01,200.00,Professional conference,networking,Conference Center,"networking,conference",Industry conference
```

## Date Format Support

The system supports multiple date formats:
- `YYYY-MM-DD` (2024-08-15)
- `MM/DD/YYYY` (08/15/2024)
- `DD/MM/YYYY` (15/08/2024)
- `YYYY-MM-DD HH:MM:SS` (2024-08-15 14:30:00)

## Amount Format Support

The system handles various amount formats:
- `1500.00`
- `$1500.00`
- `1,500.00`
- `$1,500.00`

## Upload Methods

### 1. API Upload
```bash
curl -X POST "http://localhost:8000/data/upload" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@expenses.csv"
```

### 2. Direct File Placement
Place your CSV file in the `data/` directory as `expenses.csv`

### 3. Generate Sample File
```bash
curl -X GET "http://localhost:8000/data/sample-csv"
```

## Validation

The system validates your CSV file and will report:
- Missing required columns
- Invalid date formats
- Non-numeric amount values
- File parsing errors

## Tips for Best Results

1. **Use descriptive descriptions** - The system uses these for smart categorization
2. **Include relevant tags** - Help with filtering and analysis
3. **Use consistent date formats** - Stick to one format throughout
4. **Include merchant names** - Useful for spending analysis
5. **Add notes for context** - Help with future analysis

## Error Handling

If the system encounters issues with your CSV:
- Invalid rows will be skipped with error messages
- The system will continue processing valid rows
- Check the API response for detailed error information
- Use the validation endpoint to check your file before uploading

## Getting Help

If you need help with CSV formatting:
1. Use the sample CSV generator: `GET /data/sample-csv`
2. Check the validation endpoint: `POST /data/validate`
3. Review the error messages in the API response
4. Ensure all required columns are present and properly formatted
