USER_FIELDS = (
    'id',
    'name',
    'email',
    'role',
    'points',
    'monthly_access_count',
    'is_active',
    'institution',
    'major',
    'year',
)


def serialize_user(row: dict) -> dict:
    if not row:
        return {}
    return {
        'id': str(row['id']),
        'name': row['name'],
        'email': row['email'],
        'role': row['role'],
        'points': row.get('points', 0),
        'monthly_access_count': row.get('monthly_access_count', 0),
        'is_active': row.get('is_active', True),
        'institution': row.get('institution'),
        'major': row.get('major'),
        'year': row.get('year'),
    }


def schema_payload(schema):
    if hasattr(schema, 'model_dump'):
        return schema.model_dump(exclude_unset=True)
    return schema.dict(exclude_unset=True)
