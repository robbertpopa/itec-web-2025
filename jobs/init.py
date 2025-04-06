from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, os

def init():
    load_dotenv()

    cred = credentials.Certificate("./.firebase-service-account.json")
    firebase_admin.initialize_app(cred, {
        'databaseURL': os.environ["NEXT_PUBLIC_DATABASE_URL"],
        'storageBucket': os.environ["NEXT_PUBLIC_STORAGE_BUCKET"],
    })

