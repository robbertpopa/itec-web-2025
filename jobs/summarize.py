from init import init
from RealtimeDBQueue import RealtimeDBQueue
from firebase_admin import storage
import openai
import os
import tempfile

def main():
    init()

    RealtimeDBQueue("summarizeQueue", job).run()


def job(path: str):
    bucket = storage.bucket()

    blob = bucket.blob(path)
    _, temp_file = tempfile.mkstemp()
    blob.download_to_filename(temp_file)

    try:
        with open(temp_file, 'r', encoding='utf-8') as file:
            content = file.read()
    except UnicodeDecodeError:
        raise ValueError("DECODING")

    api_key = os.environ.get("OPENAI_API_KEY")
    if api_key is None:
        raise ValueError("OPENAI_API_KEY")

    client = openai.OpenAI(api_key=api_key)

    response = client.chat.completions.create(
        model="gpt-4",
        messages=[
            {
                "role": "system",
                "content": (
                    "Summarize the following content into a concise Markdown document. "
                    "Use appropriate formatting including headings, bullet points, and "
                    "organized sections. Maintain all crucial information while making "
                    "it more compact and readable."
                )
            },
            {"role": "user", "content": content}
        ],
        temperature=0.3
    )

    summary = response.choices[0].message.content
    if summary is None:
        raise Exception("UNEXPECTED_FAIL")
        

    with open(temp_file, 'w', encoding='utf-8') as file:
        file.write(summary)

    new_path = path.replace("courses/", "summarized/")

    new_blob = bucket.blob(new_path)
    new_blob.upload_from_filename(temp_file)
    os.remove(temp_file)
    
    print(f"Created {new_path}")


if __name__ == "__main__":
    main()
