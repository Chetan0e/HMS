import asyncio
import sys
import os

# Add root project folder to sys.path
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from database.seeds.seed import seed_database

if __name__ == "__main__":
    asyncio.run(seed_database())
