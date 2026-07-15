"""Seed script to populate database with initial data.
Run: python seed.py
"""
from app.db.database import SessionLocal, engine
from app.db.base_class import Base
from app.models.member import Member
from app.auth.security import get_password_hash

def seed():
    db = SessionLocal()
    try:
        # Create admin member
        admin = Member(
            first_name="Alex",
            last_name="Chen",
            email="alex@deskmate.com",
            role="super_admin",
            status="active",
            hashed_password=get_password_hash("password123"),
        )
        db.add(admin)

        # Create a demo active member
        member = Member(
            first_name="Sarah",
            last_name="Johnson",
            email="sarah@startup.io",
            role="member",
            status="active",
            hashed_password=get_password_hash("password123"),
        )
        db.add(member)

        # Create a demo expired member
        expired = Member(
            first_name="Michael",
            last_name="Brown",
            email="michael@expired.co",
            role="member",
            status="expired",
            hashed_password=get_password_hash("password123"),
        )
        db.add(expired)

        db.commit()
        print("[OK] Seed data created successfully!")
        print("  - alex@deskmate.com / password123 (Super Admin)")
        print("  - sarah@startup.io / password123 (Active Member)")
        print("  - michael@expired.co / password123 (Expired Member)")

    except Exception as e:
        db.rollback()
        print(f"[ERROR] {e}")
    finally:
        db.close()

if __name__ == "__main__":
    seed()
