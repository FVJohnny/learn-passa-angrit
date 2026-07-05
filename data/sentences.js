// ชุดประโยค — Sentence packs (Level 2)
// Each sentence:
//   en      — English sentence (tiles split on spaces)
//   th      — Thai meaning
//   extra   — English distractor tiles (must not appear in the sentence)
//   thTiles — Thai sentence pre-split into word tiles (joined = th, no spaces)
//   thExtra — Thai distractor tiles (must not appear in thTiles)
// Questions run both directions: build the English from the Thai prompt, or
// build the Thai from the English prompt.

const SENTENCE_PACKS = [
  {
    id: 's-thisis', icon: '💬', th: 'นี่คือ… / ฉัน…', en: 'This is… / I am…',
    sentences: [
      { en: 'This is a cat', th: 'นี่คือแมว', extra: ['dog', 'he'], thTiles: ['นี่', 'คือ', 'แมว'], thExtra: ['หมา', 'ของฉัน'] },
      { en: 'This is my phone', th: 'นี่คือโทรศัพท์ของฉัน', extra: ['your', 'book'], thTiles: ['นี่', 'คือ', 'โทรศัพท์', 'ของฉัน'], thExtra: ['หนังสือ', 'ของคุณ'] },
      { en: 'I am happy', th: 'ฉันมีความสุข', extra: ['sad', 'you'], thTiles: ['ฉัน', 'มี', 'ความสุข'], thExtra: ['เศร้า', 'เขา'] },
      { en: 'I am hungry', th: 'ฉันหิว', extra: ['full', 'she'], thTiles: ['ฉัน', 'หิว'], thExtra: ['อิ่ม', 'น้ำ'] },
      { en: 'I am tired', th: 'ฉันเหนื่อย', extra: ['is', 'angry'], thTiles: ['ฉัน', 'เหนื่อย'], thExtra: ['ง่วง', 'มาก'] },
      { en: 'This is my family', th: 'นี่คือครอบครัวของฉัน', extra: ['house', 'your'], thTiles: ['นี่', 'คือ', 'ครอบครัว', 'ของฉัน'], thExtra: ['บ้าน', 'เพื่อน'] },
      { en: 'I am from Thailand', th: 'ฉันมาจากประเทศไทย', extra: ['go', 'to'], thTiles: ['ฉัน', 'มาจาก', 'ประเทศไทย'], thExtra: ['ไป', 'อยู่'] },
      { en: 'This is very good', th: 'อันนี้ดีมาก', extra: ['bad', 'not'], thTiles: ['อันนี้', 'ดี', 'มาก'], thExtra: ['แย่', 'นิดหน่อย'] },
      { en: 'I am a student', th: 'ฉันเป็นนักเรียน', extra: ['teacher', 'the'], thTiles: ['ฉัน', 'เป็น', 'นักเรียน'], thExtra: ['ครู', 'มี'] },
      { en: 'This is my friend', th: 'นี่คือเพื่อนของฉัน', extra: ['cat', 'her'], thTiles: ['นี่', 'คือ', 'เพื่อน', 'ของฉัน'], thExtra: ['แฟน', 'แมว'] },
    ],
  },
  {
    id: 's-like', icon: '💕', th: 'ฉันชอบ… / ฉันอยาก…', en: 'I like… / I want…',
    sentences: [
      { en: 'I like cats', th: 'ฉันชอบแมว', extra: ['dogs', 'want'], thTiles: ['ฉัน', 'ชอบ', 'แมว'], thExtra: ['หมา', 'รัก'] },
      { en: 'I like Thai food', th: 'ฉันชอบอาหารไทย', extra: ['eat', 'sweet'], thTiles: ['ฉัน', 'ชอบ', 'อาหารไทย'], thExtra: ['กิน', 'เผ็ด'] },
      { en: 'I want water', th: 'ฉันอยากได้น้ำ', extra: ['milk', 'like'], thTiles: ['ฉัน', 'อยากได้', 'น้ำ'], thExtra: ['นม', 'ชอบ'] },
      { en: 'I want to eat rice', th: 'ฉันอยากกินข้าว', extra: ['drink', 'egg'], thTiles: ['ฉัน', 'อยาก', 'กิน', 'ข้าว'], thExtra: ['ดื่ม', 'ไข่'] },
      { en: 'I like to sing', th: 'ฉันชอบร้องเพลง', extra: ['dance', 'you'], thTiles: ['ฉัน', 'ชอบ', 'ร้องเพลง'], thExtra: ['เต้น', 'ฟัง'] },
      { en: "I don't like coffee", th: 'ฉันไม่ชอบกาแฟ', extra: ['tea', 'want'], thTiles: ['ฉัน', 'ไม่', 'ชอบ', 'กาแฟ'], thExtra: ['ชา', 'อยาก'] },
      { en: 'I want to sleep', th: 'ฉันอยากนอน', extra: ['eat', 'go'], thTiles: ['ฉัน', 'อยาก', 'นอน'], thExtra: ['กิน', 'ไป'] },
      { en: 'I like your dress', th: 'ฉันชอบชุดเดรสของคุณ', extra: ['my', 'shoes'], thTiles: ['ฉัน', 'ชอบ', 'ชุดเดรส', 'ของคุณ'], thExtra: ['ของฉัน', 'รองเท้า'] },
      { en: 'I want to go home', th: 'ฉันอยากกลับบ้าน', extra: ['come', 'school'], thTiles: ['ฉัน', 'อยาก', 'กลับ', 'บ้าน'], thExtra: ['มา', 'โรงเรียน'] },
      { en: 'I like you', th: 'ฉันชอบคุณ', extra: ['love', 'cat'], thTiles: ['ฉัน', 'ชอบ', 'คุณ'], thExtra: ['รัก', 'เขา'] },
    ],
  },
  {
    id: 's-have', icon: '🌞', th: 'ชีวิตประจำวัน', en: 'Daily Life',
    sentences: [
      { en: 'I have a dog', th: 'ฉันมีหมา', extra: ['cat', 'want'], thTiles: ['ฉัน', 'มี', 'หมา'], thExtra: ['แมว', 'อยาก'] },
      { en: 'I eat rice every day', th: 'ฉันกินข้าวทุกวัน', extra: ['drink', 'night'], thTiles: ['ฉัน', 'กิน', 'ข้าว', 'ทุกวัน'], thExtra: ['ดื่ม', 'กลางคืน'] },
      { en: 'I have two sisters', th: 'ฉันมีพี่สาวสองคน', extra: ['three', 'brothers'], thTiles: ['ฉัน', 'มี', 'พี่สาว', 'สองคน'], thExtra: ['สามคน', 'พี่ชาย'] },
      { en: 'I drink coffee in the morning', th: 'ฉันดื่มกาแฟตอนเช้า', extra: ['tea', 'night'], thTiles: ['ฉัน', 'ดื่ม', 'กาแฟ', 'ตอนเช้า'], thExtra: ['ชา', 'ตอนเย็น'] },
      { en: 'I go to work', th: 'ฉันไปทำงาน', extra: ['come', 'sleep'], thTiles: ['ฉัน', 'ไป', 'ทำงาน'], thExtra: ['มา', 'นอน'] },
      { en: "I don't have money", th: 'ฉันไม่มีเงิน', extra: ['want', 'time'], thTiles: ['ฉัน', 'ไม่', 'มี', 'เงิน'], thExtra: ['อยาก', 'เวลา'] },
      { en: 'I sleep at night', th: 'ฉันนอนตอนกลางคืน', extra: ['morning', 'eat'], thTiles: ['ฉัน', 'นอน', 'ตอนกลางคืน'], thExtra: ['ตอนเช้า', 'กิน'] },
      { en: 'I cook dinner', th: 'ฉันทำอาหารเย็น', extra: ['eat', 'buy'], thTiles: ['ฉัน', 'ทำ', 'อาหารเย็น'], thExtra: ['กิน', 'ซื้อ'] },
      { en: 'I have a question', th: 'ฉันมีคำถาม', extra: ['answer', 'want'], thTiles: ['ฉัน', 'มี', 'คำถาม'], thExtra: ['คำตอบ', 'ถาม'] },
      { en: 'I love my family', th: 'ฉันรักครอบครัวของฉัน', extra: ['like', 'friend'], thTiles: ['ฉัน', 'รัก', 'ครอบครัว', 'ของฉัน'], thExtra: ['ชอบ', 'เพื่อน'] },
    ],
  },
  {
    id: 's-questions', icon: '🗣️', th: 'คำถามและวลี', en: 'Questions & Phrases',
    sentences: [
      { en: 'What is this', th: 'นี่คืออะไร', extra: ['that', 'who'], thTiles: ['นี่', 'คือ', 'อะไร'], thExtra: ['นั่น', 'ใคร'] },
      { en: 'Where are you', th: 'คุณอยู่ที่ไหน', extra: ['what', 'is'], thTiles: ['คุณ', 'อยู่', 'ที่ไหน'], thExtra: ['อะไร', 'ฉัน'] },
      { en: 'How much is this', th: 'อันนี้ราคาเท่าไหร่', extra: ['what', 'many'], thTiles: ['อันนี้', 'ราคา', 'เท่าไหร่'], thExtra: ['อะไร', 'กี่อัน'] },
      { en: 'What time is it', th: 'กี่โมงแล้ว', extra: ['when', 'this'], thTiles: ['กี่โมง', 'แล้ว'], thExtra: ['วันนี้', 'ตอนนี้'] },
      { en: 'Where is the toilet', th: 'ห้องน้ำอยู่ที่ไหน', extra: ['what', 'kitchen'], thTiles: ['ห้องน้ำ', 'อยู่', 'ที่ไหน'], thExtra: ['ห้องครัว', 'อะไร'] },
      { en: 'Can you help me', th: 'คุณช่วยฉันได้ไหม', extra: ['want', 'he'], thTiles: ['คุณ', 'ช่วย', 'ฉัน', 'ได้ไหม'], thExtra: ['อยาก', 'เขา'] },
      { en: "I don't understand", th: 'ฉันไม่เข้าใจ', extra: ['know', 'you'], thTiles: ['ฉัน', 'ไม่', 'เข้าใจ'], thExtra: ['รู้', 'คุณ'] },
      { en: 'Please speak slowly', th: 'กรุณาพูดช้าๆ', extra: ['fast', 'listen'], thTiles: ['กรุณา', 'พูด', 'ช้าๆ'], thExtra: ['เร็วๆ', 'ฟัง'] },
      { en: 'See you tomorrow', th: 'เจอกันพรุ่งนี้', extra: ['today', 'go'], thTiles: ['เจอกัน', 'พรุ่งนี้'], thExtra: ['วันนี้', 'ไป'] },
      { en: 'I love you', th: 'ฉันรักคุณ', extra: ['like', 'miss'], thTiles: ['ฉัน', 'รัก', 'คุณ'], thExtra: ['ชอบ', 'คิดถึง'] },
    ],
  },
  {
    id: 's-where', icon: '📍', th: 'อยู่ที่ไหน', en: 'Where Things Are',
    sentences: [
      { en: 'The cat is on the bed', th: 'แมวอยู่บนเตียง', extra: ['dog', 'under'], thTiles: ['แมว', 'อยู่', 'บน', 'เตียง'], thExtra: ['หมา', 'ใต้'] },
      { en: 'The dog is in the house', th: 'หมาอยู่ในบ้าน', extra: ['cat', 'on'], thTiles: ['หมา', 'อยู่', 'ใน', 'บ้าน'], thExtra: ['แมว', 'บน'] },
      { en: 'The phone is on the table', th: 'โทรศัพท์อยู่บนโต๊ะ', extra: ['key', 'in'], thTiles: ['โทรศัพท์', 'อยู่', 'บน', 'โต๊ะ'], thExtra: ['กุญแจ', 'ใน'] },
      { en: 'I am at home', th: 'ฉันอยู่บ้าน', extra: ['go', 'you'], thTiles: ['ฉัน', 'อยู่', 'บ้าน'], thExtra: ['ไป', 'คุณ'] },
      { en: 'She is at school', th: 'เธออยู่ที่โรงเรียน', extra: ['he', 'market'], thTiles: ['เธอ', 'อยู่', 'ที่', 'โรงเรียน'], thExtra: ['ฉัน', 'ตลาด'] },
      { en: 'The bank is near the market', th: 'ธนาคารอยู่ใกล้ตลาด', extra: ['far', 'school'], thTiles: ['ธนาคาร', 'อยู่', 'ใกล้', 'ตลาด'], thExtra: ['ไกล', 'โรงเรียน'] },
      { en: 'My house is far', th: 'บ้านของฉันอยู่ไกล', extra: ['near', 'city'], thTiles: ['บ้าน', 'ของฉัน', 'อยู่', 'ไกล'], thExtra: ['ใกล้', 'เมือง'] },
      { en: 'The money is in the bag', th: 'เงินอยู่ในกระเป๋า', extra: ['on', 'wallet'], thTiles: ['เงิน', 'อยู่', 'ใน', 'กระเป๋า'], thExtra: ['บน', 'บ้าน'] },
      { en: 'We are at the beach', th: 'เราอยู่ที่ชายหาด', extra: ['mountain', 'they'], thTiles: ['เรา', 'อยู่', 'ที่', 'ชายหาด'], thExtra: ['ภูเขา', 'เขา'] },
      { en: 'The shoes are under the bed', th: 'รองเท้าอยู่ใต้เตียง', extra: ['on', 'socks'], thTiles: ['รองเท้า', 'อยู่', 'ใต้', 'เตียง'], thExtra: ['บน', 'ถุงเท้า'] },
    ],
  },
  {
    id: 's-can', icon: '💪', th: 'ทำได้ไหม', en: 'Can & Cannot',
    sentences: [
      { en: 'Can I have water', th: 'ขอน้ำหน่อยได้ไหม', extra: ['want', 'tea'], thTiles: ['ขอ', 'น้ำ', 'หน่อย', 'ได้ไหม'], thExtra: ['ชา', 'กิน'] },
      { en: 'I can swim', th: 'ฉันว่ายน้ำได้', extra: ['run', 'cannot'], thTiles: ['ฉัน', 'ว่ายน้ำ', 'ได้'], thExtra: ['วิ่ง', 'ไม่ได้'] },
      { en: 'I cannot drive', th: 'ฉันขับรถไม่ได้', extra: ['can', 'swim'], thTiles: ['ฉัน', 'ขับรถ', 'ไม่ได้'], thExtra: ['ได้', 'ว่ายน้ำ'] },
      { en: 'Can you speak English', th: 'คุณพูดภาษาอังกฤษได้ไหม', extra: ['Thai', 'I'], thTiles: ['คุณ', 'พูด', 'ภาษาอังกฤษ', 'ได้ไหม'], thExtra: ['ภาษาไทย', 'ฉัน'] },
      { en: 'I can speak Thai', th: 'ฉันพูดภาษาไทยได้', extra: ['English', 'cannot'], thTiles: ['ฉัน', 'พูด', 'ภาษาไทย', 'ได้'], thExtra: ['ภาษาอังกฤษ', 'ไม่ได้'] },
      { en: 'Can I sit here', th: 'ฉันนั่งที่นี่ได้ไหม', extra: ['stand', 'there'], thTiles: ['ฉัน', 'นั่ง', 'ที่นี่', 'ได้ไหม'], thExtra: ['ยืน', 'ที่นั่น'] },
      { en: 'You can do it', th: 'คุณทำได้', extra: ['I', 'cannot'], thTiles: ['คุณ', 'ทำ', 'ได้'], thExtra: ['ฉัน', 'ไม่ได้'] },
      { en: 'I can cook', th: 'ฉันทำอาหารได้', extra: ['clean', 'cannot'], thTiles: ['ฉัน', 'ทำอาหาร', 'ได้'], thExtra: ['ล้าง', 'ไม่ได้'] },
      { en: 'Can we go now', th: 'เราไปตอนนี้ได้ไหม', extra: ['come', 'tomorrow'], thTiles: ['เรา', 'ไป', 'ตอนนี้', 'ได้ไหม'], thExtra: ['มา', 'พรุ่งนี้'] },
      { en: 'I can help you', th: 'ฉันช่วยคุณได้', extra: ['wait', 'cannot'], thTiles: ['ฉัน', 'ช่วย', 'คุณ', 'ได้'], thExtra: ['รอ', 'ไม่ได้'] },
    ],
  },
  {
    id: 's-day', icon: '🌅', th: 'หนึ่งวันของฉัน', en: 'My Day',
    sentences: [
      { en: 'I wake up early', th: 'ฉันตื่นนอนเช้า', extra: ['sleep', 'late'], thTiles: ['ฉัน', 'ตื่นนอน', 'เช้า'], thExtra: ['นอน', 'สาย'] },
      { en: 'I take a shower', th: 'ฉันอาบน้ำ', extra: ['eat', 'sleep'], thTiles: ['ฉัน', 'อาบน้ำ'], thExtra: ['กินข้าว', 'นอน'] },
      { en: 'I brush my teeth', th: 'ฉันแปรงฟัน', extra: ['wash', 'hair'], thTiles: ['ฉัน', 'แปรงฟัน'], thExtra: ['สระผม', 'ล้างมือ'] },
      { en: 'I eat breakfast', th: 'ฉันกินข้าวเช้า', extra: ['dinner', 'drink'], thTiles: ['ฉัน', 'กิน', 'ข้าวเช้า'], thExtra: ['ข้าวเย็น', 'ดื่ม'] },
      { en: 'I go to the market', th: 'ฉันไปตลาด', extra: ['come', 'school'], thTiles: ['ฉัน', 'ไป', 'ตลาด'], thExtra: ['มา', 'โรงเรียน'] },
      { en: 'I watch TV at night', th: 'ฉันดูทีวีตอนกลางคืน', extra: ['listen', 'morning'], thTiles: ['ฉัน', 'ดู', 'ทีวี', 'ตอนกลางคืน'], thExtra: ['ฟัง', 'ตอนเช้า'] },
      { en: 'I read a book', th: 'ฉันอ่านหนังสือ', extra: ['write', 'phone'], thTiles: ['ฉัน', 'อ่าน', 'หนังสือ'], thExtra: ['เขียน', 'โทรศัพท์'] },
      { en: 'I clean the house', th: 'ฉันทำความสะอาดบ้าน', extra: ['cook', 'room'], thTiles: ['ฉัน', 'ทำความสะอาด', 'บ้าน'], thExtra: ['ทำอาหาร', 'ห้อง'] },
      { en: 'I go to sleep at midnight', th: 'ฉันนอนตอนเที่ยงคืน', extra: ['wake', 'noon'], thTiles: ['ฉัน', 'นอน', 'ตอน', 'เที่ยงคืน'], thExtra: ['ตื่น', 'เที่ยงวัน'] },
      { en: 'I call my mother', th: 'ฉันโทรหาแม่', extra: ['father', 'help'], thTiles: ['ฉัน', 'โทรหา', 'แม่'], thExtra: ['พ่อ', 'ช่วย'] },
    ],
  },
  {
    id: 's-feel', icon: '🥰', th: 'วันนี้รู้สึก…', en: 'Feelings Today',
    sentences: [
      { en: 'I am very happy today', th: 'วันนี้ฉันมีความสุขมาก', extra: ['sad', 'yesterday'], thTiles: ['วันนี้', 'ฉัน', 'มี', 'ความสุข', 'มาก'], thExtra: ['เศร้า', 'เมื่อวาน'] },
      { en: 'She is beautiful', th: 'เธอสวย', extra: ['he', 'cute'], thTiles: ['เธอ', 'สวย'], thExtra: ['เขา', 'น่ารัก'] },
      { en: 'You are very cute', th: 'คุณน่ารักมาก', extra: ['smart', 'little'], thTiles: ['คุณ', 'น่ารัก', 'มาก'], thExtra: ['ฉลาด', 'นิดหน่อย'] },
      { en: 'I am a little tired', th: 'ฉันเหนื่อยนิดหน่อย', extra: ['very', 'happy'], thTiles: ['ฉัน', 'เหนื่อย', 'นิดหน่อย'], thExtra: ['มาก', 'หิว'] },
      { en: 'The weather is hot', th: 'อากาศร้อน', extra: ['cold', 'rain'], thTiles: ['อากาศ', 'ร้อน'], thExtra: ['หนาว', 'ฝนตก'] },
      { en: 'It is raining', th: 'ฝนกำลังตก', extra: ['sun', 'stop'], thTiles: ['ฝน', 'กำลัง', 'ตก'], thExtra: ['แดด', 'หยุด'] },
      { en: 'This food is delicious', th: 'อาหารนี้อร่อย', extra: ['spicy', 'that'], thTiles: ['อาหาร', 'นี้', 'อร่อย'], thExtra: ['เผ็ด', 'นั้น'] },
      { en: 'The water is very cold', th: 'น้ำเย็นมาก', extra: ['hot', 'little'], thTiles: ['น้ำ', 'เย็น', 'มาก'], thExtra: ['ร้อน', 'นิดหน่อย'] },
      { en: 'I am not angry', th: 'ฉันไม่โกรธ', extra: ['sad', 'very'], thTiles: ['ฉัน', 'ไม่', 'โกรธ'], thExtra: ['เศร้า', 'มาก'] },
      { en: 'Today is a good day', th: 'วันนี้เป็นวันที่ดี', extra: ['bad', 'tomorrow'], thTiles: ['วันนี้', 'เป็น', 'วันที่ดี'], thExtra: ['แย่', 'พรุ่งนี้'] },
    ],
  },
];
