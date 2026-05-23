#!/usr/bin/env python3
"""
Test Supabase connection for StudyBot
Run: python test_supabase.py
"""

import os
import sys
from pathlib import Path

# Add backend to path
sys.path.insert(0, str(Path(__file__).parent / 'src' / 'backend'))

try:
    from decouple import config
    print("✓ python-decouple loaded")
except ImportError:
    print("✗ python-decouple not installed. Run: pip install -r src/backend/requirements.txt")
    sys.exit(1)

try:
    import psycopg2
    print("✓ psycopg2 loaded")
except ImportError:
    print("✗ psycopg2 not installed. Run: pip install -r src/backend/requirements.txt")
    sys.exit(1)

def test_connection():
    """Test connection to Supabase PostgreSQL"""
    
    print("\n" + "="*60)
    print("Testing Supabase Connection")
    print("="*60 + "\n")
    
    # Load credentials from .env
    try:
        db_host = config('DB_HOST')
        db_port = config('DB_PORT')
        db_name = config('DB_NAME')
        db_user = config('DB_USER')
        db_password = config('DB_PASSWORD')
        db_sslmode = config('DB_SSLMODE', default='require')
        
        print("Configuration loaded from .env:")
        print(f"  Host:     {db_host}")
        print(f"  Port:     {db_port}")
        print(f"  Database: {db_name}")
        print(f"  User:     {db_user}")
        print(f"  SSL Mode: {db_sslmode}")
        print()
        
    except Exception as e:
        print(f"✗ Error loading .env: {e}")
        print("  Make sure .env file exists in project root")
        return False
    
    # Attempt connection
    try:
        print("Attempting to connect...")
        conn = psycopg2.connect(
            dbname=db_name,
            user=db_user,
            password=db_password,
            host=db_host,
            port=db_port,
            sslmode=db_sslmode
        )
        print("✓ Connected to Supabase successfully!\n")
        
        # Get connection info
        try:
            cursor = conn.cursor()
            
            # Check PostgreSQL version
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"Database: {version}\n")
            
            # List tables
            cursor.execute("""
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
                ORDER BY table_name;
            """)
            tables = cursor.fetchall()
            
            if tables:
                print("✓ Found database tables:")
                for table in tables:
                    cursor.execute(f"SELECT COUNT(*) FROM {table[0]};")
                    count = cursor.fetchone()[0]
                    print(f"  - {table[0]} ({count} rows)")
                print()
            else:
                print("⚠ No tables found! Run schema.sql in Supabase SQL Editor\n")
            
            cursor.close()
        except Exception as e:
            print(f"⚠ Error checking tables: {e}")
        
        conn.close()
        return True
        
    except psycopg2.OperationalError as e:
        print(f"✗ Connection failed: {e}\n")
        print("Troubleshooting:")
        print("  1. Check your credentials in .env file")
        print("  2. Verify Supabase project is active")
        print("  3. Check Supabase status: https://status.supabase.com")
        print("  4. Ensure SSL mode is 'require'")
        return False
    except Exception as e:
        print(f"✗ Unexpected error: {e}")
        return False

if __name__ == '__main__':
    success = test_connection()
    
    print("="*60)
    if success:
        print("✓ All checks passed! Your Supabase is ready.")
        print("\nNext steps:")
        print("  1. Run schema.sql: Open Supabase SQL Editor")
        print("  2. Start backend: python src/backend/manage.py runserver")
        print("  3. Start frontend: npm run dev")
    else:
        print("✗ Connection test failed. Please fix the issues above.")
    print("="*60)
    
    sys.exit(0 if success else 1)
