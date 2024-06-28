# app.py
from flask import Flask, render_template, jsonify
from chapters import chapters_en, chapters_ru
from comments import comments_en, comments_ru
import logging

app = Flask(__name__)

logging.basicConfig(level=logging.DEBUG)

def count_comments(comments, chapter):
    logging.debug(f"Counting comments for chapter {chapter}")
    comment_count = {}
    for verse, verse_comments in comments.get(chapter, {}).items():
        logging.debug(f"Verse {verse}: {verse_comments}")
        for commentator in verse_comments:
            comment_count[commentator] = comment_count.get(commentator, 0) + 1
    logging.debug(f"Comment count: {comment_count}")
    return comment_count

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/chapters/<lang>')
def get_chapters(lang):
    if lang == 'en':
        return jsonify(chapters_en)
    elif lang == 'ru':
        return jsonify(chapters_ru)
    else:
        return jsonify({"error": "Language not supported"}), 400

@app.route('/comments/<lang>/<chapter>/<verse>')
def get_comments(lang, chapter, verse):
    if lang == 'en':
        comments = comments_en.get(chapter, {}).get(verse, {})
    elif lang == 'ru':
        comments = comments_ru.get(chapter, {}).get(verse, {})
    else:
        return jsonify({"error": "Language not supported"}), 400

    return jsonify(comments)

@app.route('/comment_count/<lang>/<chapter>')
def get_comment_count(lang, chapter):
    if lang == 'en':
        comment_count = count_comments(comments_en, chapter)
    elif lang == 'ru':
        comment_count = count_comments(comments_ru, chapter)
    else:
        return jsonify({"error": "Language not supported"}), 400

    return jsonify(comment_count)

if __name__ == '__main__':
    app.run(debug=True)
