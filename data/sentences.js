// ชุดประโยค — Sentence packs (Level 2)
// Each sentence: en (split into tiles by spaces), th (Thai meaning), extra (distractor tiles)

const SENTENCE_PACKS = [
  {
    id: 's-thisis', icon: '💬', th: 'นี่คือ… / ฉัน…', en: 'This is… / I am…',
    sentences: [
      { en: 'This is a cat', th: 'นี่คือแมว', extra: ['dog', 'he'] },
      { en: 'This is my phone', th: 'นี่คือโทรศัพท์ของฉัน', extra: ['your', 'book'] },
      { en: 'I am happy', th: 'ฉันมีความสุข', extra: ['sad', 'you'] },
      { en: 'I am hungry', th: 'ฉันหิว', extra: ['full', 'she'] },
      { en: 'I am tired', th: 'ฉันเหนื่อย', extra: ['is', 'angry'] },
      { en: 'This is my family', th: 'นี่คือครอบครัวของฉัน', extra: ['house', 'your'] },
      { en: 'I am from Thailand', th: 'ฉันมาจากประเทศไทย', extra: ['go', 'to'] },
      { en: 'This is very good', th: 'อันนี้ดีมาก', extra: ['bad', 'not'] },
      { en: 'I am a student', th: 'ฉันเป็นนักเรียน', extra: ['teacher', 'the'] },
      { en: 'This is my friend', th: 'นี่คือเพื่อนของฉัน', extra: ['cat', 'her'] },
    ],
  },
  {
    id: 's-like', icon: '💕', th: 'ฉันชอบ… / ฉันอยาก…', en: 'I like… / I want…',
    sentences: [
      { en: 'I like cats', th: 'ฉันชอบแมว', extra: ['dogs', 'want'] },
      { en: 'I like Thai food', th: 'ฉันชอบอาหารไทย', extra: ['eat', 'sweet'] },
      { en: 'I want water', th: 'ฉันอยากได้น้ำ', extra: ['milk', 'like'] },
      { en: 'I want to eat rice', th: 'ฉันอยากกินข้าว', extra: ['drink', 'egg'] },
      { en: 'I like to sing', th: 'ฉันชอบร้องเพลง', extra: ['dance', 'you'] },
      { en: "I don't like coffee", th: 'ฉันไม่ชอบกาแฟ', extra: ['tea', 'want'] },
      { en: 'I want to sleep', th: 'ฉันอยากนอน', extra: ['eat', 'go'] },
      { en: 'I like your dress', th: 'ฉันชอบชุดเดรสของคุณ', extra: ['my', 'shoes'] },
      { en: 'I want to go home', th: 'ฉันอยากกลับบ้าน', extra: ['come', 'school'] },
      { en: 'I like you', th: 'ฉันชอบคุณ', extra: ['love', 'cat'] },
    ],
  },
  {
    id: 's-have', icon: '🌞', th: 'ชีวิตประจำวัน', en: 'Daily Life',
    sentences: [
      { en: 'I have a dog', th: 'ฉันมีหมา', extra: ['cat', 'want'] },
      { en: 'I eat rice every day', th: 'ฉันกินข้าวทุกวัน', extra: ['drink', 'night'] },
      { en: 'I have two sisters', th: 'ฉันมีพี่สาวสองคน', extra: ['three', 'brothers'] },
      { en: 'I drink coffee in the morning', th: 'ฉันดื่มกาแฟตอนเช้า', extra: ['tea', 'night'] },
      { en: 'I go to work', th: 'ฉันไปทำงาน', extra: ['come', 'sleep'] },
      { en: "I don't have money", th: 'ฉันไม่มีเงิน', extra: ['want', 'time'] },
      { en: 'I sleep at night', th: 'ฉันนอนตอนกลางคืน', extra: ['morning', 'eat'] },
      { en: 'I cook dinner', th: 'ฉันทำอาหารเย็น', extra: ['eat', 'buy'] },
      { en: 'I have a question', th: 'ฉันมีคำถาม', extra: ['answer', 'want'] },
      { en: 'I love my family', th: 'ฉันรักครอบครัวของฉัน', extra: ['like', 'friend'] },
    ],
  },
  {
    id: 's-questions', icon: '🗣️', th: 'คำถามและวลี', en: 'Questions & Phrases',
    sentences: [
      { en: 'What is this', th: 'นี่คืออะไร', extra: ['that', 'who'] },
      { en: 'Where are you', th: 'คุณอยู่ที่ไหน', extra: ['what', 'is'] },
      { en: 'How much is this', th: 'อันนี้ราคาเท่าไหร่', extra: ['what', 'many'] },
      { en: 'What time is it', th: 'กี่โมงแล้ว', extra: ['when', 'this'] },
      { en: 'Where is the toilet', th: 'ห้องน้ำอยู่ที่ไหน', extra: ['what', 'kitchen'] },
      { en: 'Can you help me', th: 'คุณช่วยฉันได้ไหม', extra: ['want', 'he'] },
      { en: "I don't understand", th: 'ฉันไม่เข้าใจ', extra: ['know', 'you'] },
      { en: 'Please speak slowly', th: 'กรุณาพูดช้าๆ', extra: ['fast', 'listen'] },
      { en: 'See you tomorrow', th: 'เจอกันพรุ่งนี้', extra: ['today', 'go'] },
      { en: 'I love you', th: 'ฉันรักคุณ', extra: ['like', 'miss'] },
    ],
  },
];
