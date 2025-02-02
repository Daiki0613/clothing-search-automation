import anthropic
from PIL import Image
import base64
import io

# In your code
from dotenv import load_dotenv
import os

# Manually specify the .env file path
dotenv_path = "/Users/abhivir42/machine-learning/clothing-search-automation/src/.env"
load_dotenv(dotenv_path=dotenv_path)

api_key = os.getenv('ANTHROPIC_API_KEY')

if not api_key:
    raise ValueError("API key not found! Check if .env is correctly set up.")

# def encode_image_to_base64(image_path):
#     with open(image_path, 'rb') as image_file:
#         return base64.b64encode(image_file.read()).decode('utf-8')
def encode_image_to_base64(image_path):
    with Image.open(image_path) as img:
        # Convert to RGB mode if it's not already (some PNGs are RGBA)
        img = img.convert("RGB")

        # Save as JPEG in memory
        buffered = io.BytesIO()
        img.save(buffered, format="JPEG")

        # Encode to base64
        return base64.b64encode(buffered.getvalue()).decode("utf-8")

# def compare_clothing_images(target_image_path, found_image_path):
#     # Initialize Claude client
#     client = anthropic.Anthropic(
#         api_key=api_key
#     )

#     # Encode both images
#     target_base64 = encode_image_to_base64(target_image_path)
#     found_base64 = encode_image_to_base64(found_image_path)

#     # Prepare the prompt
#     prompt = f"""
#     I'm showing you two clothing images. The first is what a customer requested, 
#     and the second is the closest match we found online. 
#     Please analyze and provide:
#     1. Key similarities between the items
#     2. Notable differences
#     3. A brief explanation of why this might be a good match
#     4. Any potential concerns the customer should be aware of

#     Please be specific about colors, patterns, materials, and design elements.
#     """

#     # Make the API call
#     message = client.messages.create(
#         model="claude-3-opus-20240229",
#         max_tokens=1000,
#         messages=[
#             {
#                 "role": "user",
#                 "content": [
#                     {
#                         "type": "text",
#                         "text": prompt
#                     },
#                     {
#                         "type": "image",
#                         "source": {
#                             "type": "base64",
#                             "media_type": "image/jpeg",
#                             "data": target_base64
#                         }
#                     },
#                     {
#                         "type": "image",
#                         "source": {
#                             "type": "base64",
#                             "media_type": "image/jpeg",
#                             "data": found_base64
#                         }
#                     }
#                 ]
#             }
#         ]
#     )

#     return message.content

# def format_comparison_results(comparison):
#     if not comparison:
#         return "Sorry, we couldn't analyze the images at this time."
    
#     # Since comparison is a list, let's convert it to string if needed
#     if isinstance(comparison, list):
#         comparison = ' '.join(str(item) for item in comparison)
    
#     # Split the comparison into sections
#     sections = comparison.split('\n\n')
    
#     formatted_result = {
#         'similarities': [],
#         'differences': [],
#         'match_explanation': '',
#         'concerns': []
#     }
    
#     current_section = None
#     for section in sections:
#         section = section.strip()
        
#         if '1. Key similarities' in section:
#             current_section = 'similarities'
#             continue
#         elif '2. Notable differences' in section:
#             current_section = 'differences'
#             continue
#         elif '3. ' in section and 'good match' in section.lower():
#             current_section = 'match_explanation'
#             continue
#         elif '4. ' in section and 'concerns' in section.lower():
#             current_section = 'concerns'
#             continue
            
#         if current_section == 'similarities':
#             formatted_result['similarities'].append(section)
#         elif current_section == 'differences':
#             formatted_result['differences'].append(section)
#         elif current_section == 'match_explanation':
#             formatted_result['match_explanation'] = section
#         elif current_section == 'concerns':
#             formatted_result['concerns'].append(section)
    
#     return formatted_result

def compare_clothing_images(target_image_path, found_image_path):
    client = anthropic.Anthropic(
        api_key=api_key
    )

    target_base64 = encode_image_to_base64(target_image_path)
    found_base64 = encode_image_to_base64(found_image_path)

    prompt = """
    I'm showing you two clothing images. The first is what a customer requested, 
    and the second is the closest match we found online. 
    Please provide your analysis in the following format:

    SIMILARITIES:
    - (list key similarities)

    DIFFERENCES:
    - (list notable differences)

    MATCH EXPLANATION:
    (explain why this is a good match)

    CONCERNS:
    - (list any potential concerns)

    Please be specific about colors, patterns, materials, and design elements.
    """

    message = client.messages.create(
        model="claude-3-opus-20240229",
        max_tokens=1000,
        messages=[
            {
                "role": "user",
                "content": [
                    {
                        "type": "text",
                        "text": prompt
                    },
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": target_base64
                        }
                    },
                    {
                        "type": "image",
                        "source": {
                            "type": "base64",
                            "media_type": "image/jpeg",
                            "data": found_base64
                        }
                    }
                ]
            }
        ]
    )

    return message.content

def format_comparison_results(comparison):
    if not comparison:
        return "Sorry, we couldn't analyze the images at this time."

    # Handle the TextBlock object
    if isinstance(comparison, list):
        comparison = comparison[0].text

    formatted_result = {
        'similarities': [],
        'differences': [],
        'match_explanation': '',
        'concerns': []
    }

    # Split the text into sections
    sections = comparison.split('\n\n')
    
    for section in sections:
        section = section.strip()
        
        if section.startswith('SIMILARITIES:'):
            # Split by newlines and remove empty strings and the header
            items = [item.strip('- ').strip() for item in section.split('\n')[1:]]
            formatted_result['similarities'] = [item for item in items if item]
            
        elif section.startswith('DIFFERENCES:'):
            items = [item.strip('- ').strip() for item in section.split('\n')[1:]]
            formatted_result['differences'] = [item for item in items if item]
            
        elif section.startswith('MATCH EXPLANATION:'):
            formatted_result['match_explanation'] = section.replace('MATCH EXPLANATION:', '').strip()
            
        elif section.startswith('CONCERNS:'):
            items = [item.strip('- ').strip() for item in section.split('\n')[1:]]
            formatted_result['concerns'] = [item for item in items if item]

    return formatted_result

# Usage remains the same, but let's improve the output formatting:
def print_formatted_comparison(formatted_comparison):
    print("\n=== Clothing Comparison Analysis ===\n")
    
    print("🔍 SIMILARITIES:")
    for sim in formatted_comparison['similarities']:
        print(f"  • {sim}")
    
    print("\n❗ DIFFERENCES:")
    for diff in formatted_comparison['differences']:
        print(f"  • {diff}")
    
    print("\n💭 MATCH EXPLANATION:")
    print(f"  {formatted_comparison['match_explanation']}")
    
    print("\n⚠️ CONCERNS:")
    for concern in formatted_comparison['concerns']:
        print(f"  • {concern}")
    
    print("\n" + "="*35)

# Main execution
target_image_path = "../../public/marshall_wace_hoodie.jpeg"
found_image_path = "../../public/result_marshall_wace.png"

# Verify images exist
import os
if not os.path.exists(target_image_path) or not os.path.exists(found_image_path):
    print("Error: One or both image paths are invalid!")
    exit(1)

# Get the comparison
comparison = compare_clothing_images(target_image_path, found_image_path)

# Format and print the response
formatted_comparison = format_comparison_results(comparison)
print_formatted_comparison(formatted_comparison)

# def format_comparison_results(comparison):
#     if not comparison:
#         return "Sorry, we couldn't analyze the images at this time."

#     # Convert comparison to string if it's a list
#     if isinstance(comparison, list):
#         comparison = ' '.join(str(item) for item in comparison)

#     formatted_result = {
#         'similarities': [],
#         'differences': [],
#         'match_explanation': '',
#         'concerns': []
#     }

#     # Split by sections using the headers
#     text = comparison.lower()
    
#     # Find the section boundaries
#     similarities_start = text.find('similarities:')
#     differences_start = text.find('differences:')
#     match_start = text.find('match explanation:')
#     concerns_start = text.find('concerns:')

#     if similarities_start != -1 and differences_start != -1:
#         similarities_text = comparison[similarities_start:differences_start].strip()
#         formatted_result['similarities'] = [item.strip() for item in similarities_text.split('\n') if item.strip() and item.strip() != 'SIMILARITIES:']

#     if differences_start != -1 and match_start != -1:
#         differences_text = comparison[differences_start:match_start].strip()
#         formatted_result['differences'] = [item.strip() for item in differences_text.split('\n') if item.strip() and item.strip() != 'DIFFERENCES:']

#     if match_start != -1 and concerns_start != -1:
#         match_text = comparison[match_start:concerns_start].strip()
#         formatted_result['match_explanation'] = match_text.replace('MATCH EXPLANATION:', '').strip()

#     if concerns_start != -1:
#         concerns_text = comparison[concerns_start:].strip()
#         formatted_result['concerns'] = [item.strip() for item in concerns_text.split('\n') if item.strip() and item.strip() != 'CONCERNS:']

#     return formatted_result

# # Usage
# target_image_path = "../../public/marshall_wace_hoodie.jpeg"
# found_image_path = "../../public/result_marshall_wace.png"
# comparison = compare_clothing_images(target_image_path, found_image_path)
# # formatted_comparison = format_comparison_results(comparison)

# # print(formatted_comparison)

# # Try formatting
# # try:
# #     formatted_comparison = format_comparison_results(comparison)
# #     print("\nFormatted Response:")
# #     print("Similarities:", formatted_comparison['similarities'])
# #     print("Differences:", formatted_comparison['differences'])
# #     print("Match Explanation:", formatted_comparison['match_explanation'])
# #     print("Concerns:", formatted_comparison['concerns'])
# # except Exception as e:
# #     print(f"\nError formatting response: {e}")
# #     print("Raw response structure:", type(comparison))
# #     if isinstance(comparison, list):
# #         print("Response content:", comparison)

# # Print raw response first
# print("Raw Claude Response:")
# print(comparison)
# print("\n" + "="*50 + "\n")

# # Format and print the response
# formatted_comparison = format_comparison_results(comparison)

# print("Formatted Response:")
# print("\nSimilarities:")
# for sim in formatted_comparison['similarities']:
#     print(f"- {sim}")

# print("\nDifferences:")
# for diff in formatted_comparison['differences']:
#     print(f"- {diff}")

# print("\nMatch Explanation:")
# print(formatted_comparison['match_explanation'])

# print("\nConcerns:")
# for concern in formatted_comparison['concerns']:
#     print(f"- {concern}")
