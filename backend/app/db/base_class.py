import re
from typing import Any
from sqlalchemy.orm import declared_attr
from sqlalchemy.orm import declarative_base

class CustomBase:
    id: Any
    __name__: str
    
    # Generate __tablename__ automatically
    @declared_attr
    def __tablename__(cls) -> str:
        name = cls.__name__
        # Convert CamelCase to snake_case
        s1 = re.sub('(.)([A-Z][a-z]+)', r'\1_\2', name)
        return re.sub('([a-z0-9])([A-Z])', r'\1_\2', s1).lower()

Base = declarative_base(cls=CustomBase)
