from dotenv import load_dotenv
import os
from openai import OpenAI

load_dotenv()

client = OpenAI(api_key=os.getenv("OPENAI_API"))

def deep_dive(text):
    response = client.responses.create(
        model="gpt-4o",
        tools=[{"type": "web_search_preview"}],
        input=f"""
    So this is a news, article or a blog. 
    {text}
    Go on web and search if this is true or not and also provide the sources of the information you have analyzed to get to this answer.
    You answer should be in the following format:
    <answer>True/False</answer>
    <sources>[Sources you had to look into]</sources>"""
    )
    return response.output_text

def summarizer(text):
    response = client.responses.create(
    model="gpt-4o",
    instructions="""
You have to summarize the whole text of the document into very small text maybe 150-200 to state everything that the document is about.
It should include the main agenda of the document and the main points that are discussed in the document.

""",
    input=text,
    )

    return response.output_text