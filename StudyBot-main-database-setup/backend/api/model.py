from django.db import models

class User(models.Model):
    ROLE_CHOICES = [
        ('student', 'Student'),
        ('faculty', 'Faculty'),
        ('researcher', 'Researcher'),
        ('visitor', 'Visitor'),
        ('admin', 'Admin'),
    ]
    id = models.CharField(max_length=50, primary_key=True)
    name = models.CharField(max_length=100)
    email = models.EmailField(max_length=150, unique=True)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='student')
    institution = models.CharField(max_length=150, blank=True, null=True)
    major = models.CharField(max_length=100, blank=True, null=True)
    study_year = models.CharField(max_length=50, blank=True, null=True)
    points = models.IntegerField(default=0)
    monthly_access_limit = models.IntegerField(default=2)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'users'

class Resource(models.Model):
    CATEGORY_CHOICES = [
        ('Courses', 'Courses'),
        ('Projects', 'Projects'),
        ('Research', 'Research'),
        ('Documents', 'Documents'),
    ]
    id = models.CharField(max_length=50, primary_key=True)
    title = models.CharField(max_length=255)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    uploader = models.ForeignKey(User, on_delete=models.CASCADE, db_column='uploader_id')
    description = models.TextField(blank=True, null=True)
    full_details = models.TextField(blank=True, null=True)
    is_public = models.BooleanField(default=True)
    external_link = models.CharField(max_length=255, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'resources'

class ResourceTopic(models.Model):
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, db_column='resource_id')
    topic_name = models.CharField(max_length=100)

    class Meta:
        db_table = 'resource_topics'
        unique_together = ('resource', 'topic_name')

class ResourceFile(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, db_column='resource_id')
    file_name = models.CharField(max_length=255)
    file_size = models.CharField(max_length=50, blank=True, null=True)
    file_type = models.CharField(max_length=50, blank=True, null=True)
    file_url = models.CharField(max_length=255)

    class Meta:
        db_table = 'resource_files'

class UserResourceAccess(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, db_column='resource_id')
    points_spent = models.IntegerField()
    unlocked_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'user_resource_access'
        unique_together = ('user', 'resource')

class Review(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    resource = models.ForeignKey(Resource, on_delete=models.CASCADE, db_column='resource_id')
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    rating = models.IntegerField(null=True)
    comment = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'reviews'
        unique_together = ('resource', 'user')

class CalendarEvent(models.Model):
    EVENT_TYPES = [
        ('exam', 'Exam'),
        ('deadline', 'Deadline'),
        ('reminder', 'Reminder'),
        ('class', 'Class'),
    ]
    id = models.CharField(max_length=50, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True, null=True)
    event_type = models.CharField(max_length=20, choices=EVENT_TYPES)
    event_date = models.DateTimeField()
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'calendar_events'

class ActivityLog(models.Model):
    ACTIVITY_TYPES = [
        ('request', 'Request'),
        ('review', 'Review'),
        ('upload', 'Upload'),
    ]
    id = models.CharField(max_length=50, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    activity_type = models.CharField(max_length=20, choices=ACTIVITY_TYPES)
    message = models.CharField(max_length=255)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'activity_logs'

class Notification(models.Model):
    id = models.CharField(max_length=50, primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column='user_id')
    message = models.CharField(max_length=255)
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'notifications'
