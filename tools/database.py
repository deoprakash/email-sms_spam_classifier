import sqlite3

def create_db():
    conn = sqlite3.connect('spam_classifier.db')
    cursor = conn.cursor()
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS predictions(
    id INTEGER PRIMARY KEY AUTOINCREMENT, 
    message TEXT NOT NULL,
    prediction TEXT NOT NULL, 
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)
    ''')
    conn.commit()
    conn.close()

if __name__ == '__main__':
    create_db()