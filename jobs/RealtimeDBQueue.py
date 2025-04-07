import time
from datetime import timezone
from firebase_admin import db, datetime
from firebase_admin.exceptions import FirebaseError

class RealtimeDBQueue:
    DELAY_ON_EMPTY=10
    queue_ref: db.Reference

    def __init__(self, table_name: str, func):
        self.queue_ref = db.reference(table_name)
        self.func = func

    def run(self):
        while True:
            self.process_queue()

    def process_queue(self):
        query = self.queue_ref\
            .order_by_child('status')\
            .equal_to('waiting')\
            .limit_to_first(1)
        snapshot = query.get()

        if not snapshot:
            print("No waiting tasks found")
            time.sleep(RealtimeDBQueue.DELAY_ON_EMPTY)
            return

        task_id = next(iter(snapshot.keys()))
        task_path = snapshot[task_id]['path']
        task_ref = self.queue_ref.child(task_id)

        try:
            def transaction_update(task_data):
                if task_data and task_data.get('status') == 'waiting':
                    task_data['status'] = 'in-progress'
                    task_data['lastUpdated'] = self.iso_now()
                    return task_data
                return None

            if task_ref.transaction(transaction_update):
                print(f"Claimed task {task_id}")
                self.process_task(task_ref, task_path)
            else:
                print(f"Task {task_id} was already claimed by another worker")

        except FirebaseError as error:
            print(f"Transaction failed: {error}")

    def process_task(self, task_ref, task_path):
        try:
            self.func(task_path)

            updates = {
                'status': 'done',
                'lastUpdated': self.iso_now()
            }
            task_ref.update(updates)
            print("Task marked as done")

        except Exception as e:
            # Handle processing failure
            error_updates = {
                'status': 'error',
                'lastUpdated': self.iso_now(),
                'error': str(e)
            }
            task_ref.update(error_updates)
            print(f"Task failed: {e}")

    def iso_now(self):
        return datetime.datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')
