const fs = require('fs');
const path = require('path');
const { curriculumPlan } = require('../../data/curriculum-plan');
const { DIALECTS, getLanguageMeta } = require('../../data/content-standard');
const { normalizeItemAudio } = require('../../utils/content-audio');
const { assertCatalogShape, assertTrialShape } = require('../../utils/content-validate');

const OUTPUT_PATH = path.join(__dirname, '..', '..', 'data', 'expanded-curriculum.js');

const LEVEL_NAMES = {
  beginner: '零基础',
  elementary: '初级',
  intermediate: '中等'
};

const LEVEL_SUMMARY = {
  beginner: '从音节、单词和短句开始，把发音底盘练稳。',
  elementary: '进入高频场景表达，训练节奏、重音和自然衔接。',
  intermediate: '用更长的句子做综合跟读，强化语气和稳定度。'
};

const SHARED_DIMENSION_TIPS = {
  toneContour: '声调走势要完整，起点和终点都要稳。',
  southernToneFlow: '南越调型更顺，但不能读平。',
  vowelShape: '元音口型要稳定，不要滑到中文近似音。',
  vowelOpenness: '开口度要放松，但不要把元音拉变形。',
  vowelLength: '长短元音要拉开时长差。',
  vowelStability: '每个元音保持清楚，不要英语化弱读。',
  vowelClarity: '元音要明亮清楚，别压扁。',
  finalClosure: '尾音只收口，不要多读出一个尾巴。',
  finalStop: '塞音尾音短促闭住，不要爆破。',
  softFinals: '尾音收得轻而短，不要完全丢掉。',
  aspiration: '送气要清楚，但不要喷得过重。',
  initialContrast: '起音差异要分开，别把相近声母合并。',
  regionalInitials: '注意地区口音里的声母合流和自然读法。',
  stressPlacement: '重音位置要放准，避免词义变掉。',
  glottalStop: '喉塞音要短促收住。',
  schwaControl: '中央元音要轻而稳，不能读成完整 a/e。',
  nasalPlacement: '鼻音位置要准确，尤其是 ng。',
  nasalization: '鼻化要带在元音里，不要额外加 n。',
  retroflexPosition: '卷舌舌位要到位，不要读成普通 t/d/l/n。',
  dentalPosition: '齿音要靠近齿背，别读成卷舌。',
  lateralContrast: '不同 l 类音要拉开舌位。',
  rhoticContrast: 'r 类音不要混成同一个音。',
  gemination: '重辅音要有停顿和时长感。',
  syllableRhythm: '音节边界要清楚，节奏不要一字一顿。',
  syllableTiming: '每个音节时长更均匀，别被中文重音带跑。',
  phraseRhythm: '短句要自然分组，关键词更清楚。',
  phraseFlow: '整句连起来读，不要把每个词都切开。',
  phraseIntonation: '句尾语气要自然，问句和陈述句要分开。'
};

const BANKS = {
  north: {
    syllables: ['ba', 'bà', 'bá', 'bả', 'bã', 'bạ', 'ma', 'mà', 'má', 'mả', 'mã', 'mạ', 'an', 'ăn', 'ân', 'ang', 'anh', 'ong', 'ông', 'ưng', 'at', 'ac', 'ach', 'am', 'âm', 'em', 'êm', 'it', 'ich', 'ut'],
    words: [
      ['xin', '问候开头音节'], ['chào', '你好'], ['cảm ơn', '谢谢'], ['vâng', '好的'], ['không', '不'], ['đúng', '正确'], ['sai', '错误'], ['bạn', '你'], ['tôi', '我'], ['mình', '我'],
      ['cà phê', '咖啡'], ['trà đá', '冰茶'], ['nước mía', '甘蔗汁'], ['phở bò', '牛肉粉'], ['bánh mì', '法棍三明治'], ['cơm tấm', '碎米饭'], ['một', '一'], ['hai', '二'], ['ba', '三'], ['bốn', '四'],
      ['năm', '五'], ['mua', '买'], ['bán', '卖'], ['giá', '价格'], ['rẻ', '便宜'], ['đắt', '贵'], ['đơn hàng', '订单'], ['giao hàng', '配送'], ['địa chỉ', '地址'], ['hóa đơn', '发票'],
      ['hôm nay', '今天'], ['ngày mai', '明天'], ['ở đây', '这里'], ['ở đâu', '哪里'], ['bao nhiêu', '多少钱'], ['giúp tôi', '帮我'], ['làm ơn', '请'], ['xin lỗi', '对不起'], ['rất ngon', '很好吃'], ['rất tốt', '很好']
    ],
    sentenceObjects: [['cà phê đá', '冰咖啡'], ['trà đá', '冰茶'], ['phở bò', '牛肉粉'], ['bánh mì', '法棍三明治'], ['cơm tấm', '碎米饭'], ['một đơn hàng', '一个订单'], ['mã giảm giá', '优惠码'], ['địa chỉ giao hàng', '收货地址'], ['số điện thoại', '电话号码'], ['hóa đơn', '发票']],
    sentencePatterns: [
      (o) => [`Tôi muốn gọi ${o[0]}.`, `我想点${o[1]}。`],
      (o) => [`Cho tôi ${o[0]} nhé.`, `请给我${o[1]}。`],
      (o) => [`${o[0]} này rất tốt.`, `这个${o[1]}很好。`],
      (o) => [`Bạn kiểm tra ${o[0]} giúp tôi.`, `请帮我检查${o[1]}。`],
      (o) => [`Tôi cần đổi ${o[0]}.`, `我需要更换${o[1]}。`],
      (o) => [`${o[0]} đã sẵn sàng chưa?`, `${o[1]}准备好了吗？`],
      (o) => [`Hôm nay tôi luyện ${o[0]}.`, `今天我练${o[1]}。`],
      (o) => [`Xin nói chậm lại về ${o[0]}.`, `请把${o[1]}说慢一点。`],
      (o) => [`Tôi nghe rõ ${o[0]}.`, `我听清楚${o[1]}了。`],
      (o) => [`Cảm ơn bạn vì ${o[0]}.`, `谢谢你处理${o[1]}。`]
    ],
    trial: ['Cà phê sữa đá ngon quá', '冰奶咖啡太好喝了']
  },
  south: {
    syllables: ['ba', 'bà', 'bá', 'bả', 'bã', 'bạ', 'ma', 'mà', 'má', 'mả', 'mã', 'mạ', 'an', 'ăn', 'ân', 'ang', 'anh', 'ong', 'ông', 'ưng', 'at', 'ac', 'ach', 'am', 'âm', 'em', 'êm', 'it', 'ich', 'ut'],
    words: [
      ['xin', '问候开头音节'], ['chào', '你好'], ['cảm ơn', '谢谢'], ['dạ', '好的'], ['không', '不'], ['đúng rồi', '对了'], ['bạn', '你'], ['tui', '我'], ['mình', '我'], ['ngon', '好吃'],
      ['cà phê', '咖啡'], ['trà đá', '冰茶'], ['nước mía', '甘蔗汁'], ['hủ tiếu', '粿条汤'], ['bánh mì', '法棍三明治'], ['cơm tấm', '碎米饭'], ['một', '一'], ['hai', '二'], ['ba', '三'], ['bốn', '四'],
      ['năm', '五'], ['mua', '买'], ['bán', '卖'], ['giá', '价格'], ['rẻ', '便宜'], ['mắc', '贵'], ['đơn hàng', '订单'], ['giao hàng', '配送'], ['địa chỉ', '地址'], ['hóa đơn', '发票'],
      ['bữa nay', '今天'], ['ngày mai', '明天'], ['ở đây', '这里'], ['ở đâu', '哪里'], ['bao nhiêu', '多少钱'], ['giúp tui', '帮我'], ['làm ơn', '请'], ['xin lỗi', '对不起'], ['ngon quá', '太好吃了'], ['được rồi', '可以了']
    ],
    sentenceObjects: [['cà phê sữa đá', '冰奶咖啡'], ['trà đá', '冰茶'], ['hủ tiếu', '粿条汤'], ['bánh mì', '法棍三明治'], ['cơm tấm', '碎米饭'], ['một đơn hàng', '一个订单'], ['mã giảm giá', '优惠码'], ['địa chỉ giao hàng', '收货地址'], ['số điện thoại', '电话号码'], ['hóa đơn', '发票']],
    sentencePatterns: [
      (o) => [`Tui muốn gọi ${o[0]}.`, `我想点${o[1]}。`],
      (o) => [`Cho tui ${o[0]} nha.`, `请给我${o[1]}。`],
      (o) => [`${o[0]} này ngon ghê.`, `这个${o[1]}很好。`],
      (o) => [`Bạn coi ${o[0]} giúp tui.`, `请帮我看一下${o[1]}。`],
      (o) => [`Tui cần đổi ${o[0]}.`, `我需要更换${o[1]}。`],
      (o) => [`${o[0]} xong chưa?`, `${o[1]}好了吗？`],
      (o) => [`Bữa nay tui luyện ${o[0]}.`, `今天我练${o[1]}。`],
      (o) => [`Nói chậm lại về ${o[0]} nha.`, `请把${o[1]}说慢一点。`],
      (o) => [`Tui nghe rõ ${o[0]}.`, `我听清楚${o[1]}了。`],
      (o) => [`Cảm ơn bạn vì ${o[0]}.`, `谢谢你处理${o[1]}。`]
    ],
    trial: ['Cà phê sữa đá ngon quá', '冰奶咖啡太好喝了']
  },
  thai: {
    syllables: ['กา', 'ก่า', 'ก้า', 'ก๊า', 'ก๋า', 'มา', 'ม่า', 'ม้า', 'น้ำ', 'ข้าว', 'ไป', 'ไม่', 'ได้', 'ดี', 'กิน', 'ร้าน', 'ช้า', 'เร็ว', 'ครับ', 'ค่ะ', 'นอน', 'งาน', 'เงิน', 'แพง', 'ถูก', 'ร้อน', 'เย็น', 'หวาน', 'เผ็ด', 'สด'],
    words: [['กาแฟ', '咖啡'], ['ชาเย็น', '冰茶'], ['ข้าวผัด', '炒饭'], ['น้ำเปล่า', '白水'], ['อร่อย', '好吃'], ['ขอบคุณ', '谢谢'], ['สวัสดี', '你好'], ['ราคา', '价格'], ['ถูก', '便宜'], ['แพง', '贵'], ['ส่งของ', '发货'], ['ที่อยู่', '地址'], ['โทรศัพท์', '电话'], ['วันนี้', '今天'], ['พรุ่งนี้', '明天'], ['ร้านค้า', '店铺'], ['ลูกค้า', '客户'], ['คำสั่งซื้อ', '订单'], ['ลดราคา', '打折'], ['ช่วยด้วย', '帮忙'], ['ช้า', '慢'], ['เร็ว', '快'], ['ร้อน', '热'], ['เย็น', '冷'], ['หวาน', '甜'], ['เผ็ด', '辣'], ['สด', '新鲜'], ['สะดวก', '方便'], ['ถูกต้อง', '正确'], ['อีกครั้ง', '再一次']],
    sentenceObjects: [['กาแฟเย็น', '冰咖啡'], ['ชาเย็น', '冰茶'], ['ข้าวผัด', '炒饭'], ['น้ำเปล่า', '白水'], ['สินค้า', '商品'], ['คำสั่งซื้อ', '订单'], ['ที่อยู่จัดส่ง', '收货地址'], ['เบอร์โทรศัพท์', '电话号码'], ['ราคา', '价格'], ['ส่วนลด', '折扣']],
    sentencePatterns: [
      (o) => [`ฉันอยากสั่ง ${o[0]}`, `我想点${o[1]}。`],
      (o) => [`ขอ ${o[0]} หน่อยค่ะ`, `请给我${o[1]}。`],
      (o) => [`${o[0]} นี้ดีมาก`, `这个${o[1]}很好。`],
      (o) => [`ช่วยตรวจ ${o[0]} ให้หน่อย`, `请帮我检查${o[1]}。`],
      (o) => [`${o[0]} พร้อมหรือยัง`, `${o[1]}准备好了吗？`],
      (o) => [`พูด ${o[0]} ช้า ๆ ได้ไหม`, `可以把${o[1]}说慢一点吗？`],
      (o) => [`วันนี้ฉันฝึก ${o[0]}`, `今天我练${o[1]}。`],
      (o) => [`ฉันได้ยิน ${o[0]} ชัดแล้ว`, `我听清楚${o[1]}了。`],
      (o) => [`ขอบคุณสำหรับ ${o[0]}`, `谢谢你处理${o[1]}。`],
      (o) => [`${o[0]} ราคาเท่าไหร่`, `${o[1]}多少钱？`]
    ],
    trial: ['กาแฟเย็นนี้อร่อยมาก', '这杯冰咖啡很好喝']
  },
  malay: {
    syllables: ['ba', 'be', 'bi', 'bo', 'bu', 'ka', 'ke', 'ki', 'ko', 'ku', 'ma', 'me', 'mi', 'mo', 'mu', 'nga', 'nya', 'ra', 'la', 'sa', 'pa', 'ta', 'da', 'ga', 'ai', 'au', 'oi', 'kan', 'lah', 'pun'],
    words: [['kopi', '咖啡'], ['teh ais', '冰茶'], ['nasi', '米饭'], ['air kosong', '白水'], ['sedap', '好吃'], ['terima kasih', '谢谢'], ['selamat pagi', '早上好'], ['harga', '价格'], ['murah', '便宜'], ['mahal', '贵'], ['pesanan', '订单'], ['alamat', '地址'], ['telefon', '电话'], ['hari ini', '今天'], ['esok', '明天'], ['kedai', '店铺'], ['pelanggan', '客户'], ['barang', '商品'], ['diskaun', '折扣'], ['tolong', '请帮忙'], ['perlahan', '慢'], ['cepat', '快'], ['panas', '热'], ['sejuk', '冷'], ['manis', '甜'], ['pedas', '辣'], ['segar', '新鲜'], ['senang', '方便'], ['betul', '正确'], ['sekali lagi', '再一次']],
    sentenceObjects: [['kopi ais', '冰咖啡'], ['teh ais', '冰茶'], ['nasi goreng', '炒饭'], ['air kosong', '白水'], ['barang ini', '这个商品'], ['pesanan saya', '我的订单'], ['alamat penghantaran', '收货地址'], ['nombor telefon', '电话号码'], ['harga ini', '这个价格'], ['diskaun ini', '这个折扣']],
    sentencePatterns: [
      (o) => [`Saya mahu pesan ${o[0]}.`, `我想点${o[1]}。`],
      (o) => [`Tolong beri saya ${o[0]}.`, `请给我${o[1]}。`],
      (o) => [`${o[0]} ini sangat bagus.`, `这个${o[1]}很好。`],
      (o) => [`Tolong semak ${o[0]}.`, `请帮我检查${o[1]}。`],
      (o) => [`${o[0]} sudah siap?`, `${o[1]}准备好了吗？`],
      (o) => [`Boleh cakap ${o[0]} perlahan?`, `可以把${o[1]}说慢一点吗？`],
      (o) => [`Hari ini saya berlatih ${o[0]}.`, `今天我练${o[1]}。`],
      (o) => [`Saya dengar ${o[0]} dengan jelas.`, `我听清楚${o[1]}了。`],
      (o) => [`Terima kasih untuk ${o[0]}.`, `谢谢你处理${o[1]}。`],
      (o) => [`Berapa harga ${o[0]}?`, `${o[1]}多少钱？`]
    ],
    trial: ['Kopi ais ini memang sedap', '这杯冰咖啡真的好喝']
  },
  indo: {
    syllables: ['ba', 'be', 'bi', 'bo', 'bu', 'ka', 'ke', 'ki', 'ko', 'ku', 'ma', 'me', 'mi', 'mo', 'mu', 'nga', 'nya', 'ra', 'la', 'sa', 'pa', 'ta', 'da', 'ga', 'ai', 'au', 'oi', 'kan', 'lah', 'pun'],
    words: [['kopi', '咖啡'], ['es teh', '冰茶'], ['nasi', '米饭'], ['air putih', '白水'], ['enak', '好吃'], ['terima kasih', '谢谢'], ['selamat pagi', '早上好'], ['harga', '价格'], ['murah', '便宜'], ['mahal', '贵'], ['pesanan', '订单'], ['alamat', '地址'], ['telepon', '电话'], ['hari ini', '今天'], ['besok', '明天'], ['toko', '店铺'], ['pelanggan', '客户'], ['barang', '商品'], ['diskon', '折扣'], ['tolong', '请帮忙'], ['pelan-pelan', '慢一点'], ['cepat', '快'], ['panas', '热'], ['dingin', '冷'], ['manis', '甜'], ['pedas', '辣'], ['segar', '新鲜'], ['mudah', '方便'], ['benar', '正确'], ['sekali lagi', '再一次']],
    sentenceObjects: [['es kopi', '冰咖啡'], ['es teh', '冰茶'], ['nasi goreng', '炒饭'], ['air putih', '白水'], ['barang ini', '这个商品'], ['pesanan saya', '我的订单'], ['alamat pengiriman', '收货地址'], ['nomor telepon', '电话号码'], ['harga ini', '这个价格'], ['diskon ini', '这个折扣']],
    sentencePatterns: [
      (o) => [`Saya mau pesan ${o[0]}.`, `我想点${o[1]}。`],
      (o) => [`Tolong beri saya ${o[0]}.`, `请给我${o[1]}。`],
      (o) => [`${o[0]} ini sangat bagus.`, `这个${o[1]}很好。`],
      (o) => [`Tolong cek ${o[0]}.`, `请帮我检查${o[1]}。`],
      (o) => [`${o[0]} sudah siap?`, `${o[1]}准备好了吗？`],
      (o) => [`Bisa bicara tentang ${o[0]} pelan-pelan?`, `可以把${o[1]}说慢一点吗？`],
      (o) => [`Hari ini saya latihan ${o[0]}.`, `今天我练${o[1]}。`],
      (o) => [`Saya sudah dengar ${o[0]} dengan jelas.`, `我听清楚${o[1]}了。`],
      (o) => [`Terima kasih untuk ${o[0]}.`, `谢谢你处理${o[1]}。`],
      (o) => [`Berapa harga ${o[0]}?`, `${o[1]}多少钱？`]
    ],
    trial: ['Es kopi ini enak sekali', '这杯冰咖啡很好喝']
  },
  tagalog: {
    syllables: ['ma', 'na', 'ka', 'pa', 'ta', 'ba', 'da', 'ga', 'la', 'ra', 'sa', 'ya', 'wa', 'nga', 'ko', 'mo', 'po', 'to', 'ku', 'ti', 'li', 'mi', 'ni', 'ang', 'ng', 'sal', 'mat', 'ka', 'pe', 'bay'],
    words: [['kape', '咖啡'], ['tsaa', '茶'], ['kanin', '米饭'], ['tubig', '水'], ['masarap', '好吃'], ['salamat', '谢谢'], ['magandang umaga', '早上好'], ['presyo', '价格'], ['mura', '便宜'], ['mahal', '贵'], ['order', '订单'], ['address', '地址'], ['telepono', '电话'], ['ngayon', '今天'], ['bukas', '明天'], ['tindahan', '店铺'], ['customer', '客户'], ['produkto', '商品'], ['discount', '折扣'], ['tulong', '帮忙'], ['dahan-dahan', '慢一点'], ['mabilis', '快'], ['mainit', '热'], ['malamig', '冷'], ['matamis', '甜'], ['maanghang', '辣'], ['sariwa', '新鲜'], ['madali', '方便'], ['tama', '正确'], ['ulit', '再一次']],
    sentenceObjects: [['malamig na kape', '冰咖啡'], ['malamig na tsaa', '冰茶'], ['sinangag', '炒饭'], ['tubig', '水'], ['produktong ito', '这个商品'], ['order ko', '我的订单'], ['delivery address', '收货地址'], ['numero ng telepono', '电话号码'], ['presyong ito', '这个价格'], ['discount na ito', '这个折扣']],
    sentencePatterns: [
      (o) => [`Gusto kong umorder ng ${o[0]}.`, `我想点${o[1]}。`],
      (o) => [`Pahingi po ng ${o[0]}.`, `请给我${o[1]}。`],
      (o) => [`Maganda ang ${o[0]}.`, `这个${o[1]}很好。`],
      (o) => [`Pakisuri ang ${o[0]}.`, `请帮我检查${o[1]}。`],
      (o) => [`Handa na ba ang ${o[0]}?`, `${o[1]}准备好了吗？`],
      (o) => [`Puwede bang sabihin ang ${o[0]} nang dahan-dahan?`, `可以把${o[1]}说慢一点吗？`],
      (o) => [`Ngayon nagsasanay ako ng ${o[0]}.`, `今天我练${o[1]}。`],
      (o) => [`Narinig ko nang malinaw ang ${o[0]}.`, `我听清楚${o[1]}了。`],
      (o) => [`Salamat sa ${o[0]}.`, `谢谢你处理${o[1]}。`],
      (o) => [`Magkano ang ${o[0]}?`, `${o[1]}多少钱？`]
    ],
    trial: ['Masarap ang malamig na kape', '冰咖啡很好喝']
  },
  hindi: {
    syllables: ['का', 'खा', 'गा', 'घा', 'ता', 'था', 'दा', 'धा', 'टा', 'ठा', 'डा', 'ढा', 'पा', 'फा', 'बा', 'भा', 'मा', 'ना', 'रा', 'ला', 'शा', 'सा', 'नी', 'गी', 'की', 'ति', 'दी', 'भाई', 'चाय', 'जल'],
    words: [['कॉफी', '咖啡'], ['चाय', '茶'], ['चावल', '米饭'], ['पानी', '水'], ['स्वादिष्ट', '好吃'], ['धन्यवाद', '谢谢'], ['नमस्ते', '你好'], ['कीमत', '价格'], ['सस्ता', '便宜'], ['महंगा', '贵'], ['ऑर्डर', '订单'], ['पता', '地址'], ['फोन', '电话'], ['आज', '今天'], ['कल', '明天'], ['दुकान', '店铺'], ['ग्राहक', '客户'], ['सामान', '商品'], ['छूट', '折扣'], ['मदद', '帮忙'], ['धीरे', '慢一点'], ['जल्दी', '快'], ['गरम', '热'], ['ठंडा', '冷'], ['मीठा', '甜'], ['तीखा', '辣'], ['ताज़ा', '新鲜'], ['आसान', '方便'], ['सही', '正确'], ['फिर से', '再一次']],
    sentenceObjects: [['ठंडी कॉफी', '冰咖啡'], ['ठंडी चाय', '冰茶'], ['तला हुआ चावल', '炒饭'], ['पानी', '水'], ['यह सामान', '这个商品'], ['मेरा ऑर्डर', '我的订单'], ['डिलीवरी पता', '收货地址'], ['फोन नंबर', '电话号码'], ['यह कीमत', '这个价格'], ['यह छूट', '这个折扣']],
    sentencePatterns: [
      (o) => [`मैं ${o[0]} ऑर्डर करना चाहता हूँ।`, `我想点${o[1]}。`],
      (o) => [`कृपया मुझे ${o[0]} दीजिए।`, `请给我${o[1]}。`],
      (o) => [`${o[0]} बहुत अच्छा है।`, `这个${o[1]}很好。`],
      (o) => [`कृपया ${o[0]} जांच दीजिए।`, `请帮我检查${o[1]}。`],
      (o) => [`क्या ${o[0]} तैयार है?`, `${o[1]}准备好了吗？`],
      (o) => [`क्या आप ${o[0]} धीरे बोल सकते हैं?`, `可以把${o[1]}说慢一点吗？`],
      (o) => [`आज मैं ${o[0]} का अभ्यास करता हूँ।`, `今天我练${o[1]}。`],
      (o) => [`मैंने ${o[0]} साफ सुना।`, `我听清楚${o[1]}了。`],
      (o) => [`${o[0]} के लिए धन्यवाद।`, `谢谢你处理${o[1]}。`],
      (o) => [`${o[0]} की कीमत कितनी है?`, `${o[1]}多少钱？`]
    ],
    trial: ['यह ठंडी कॉफी बहुत अच्छी है', '这杯冰咖啡很好喝']
  },
  tamil: {
    syllables: ['கா', 'கி', 'கூ', 'சா', 'சீ', 'டா', 'டி', 'தா', 'தி', 'பா', 'பி', 'மா', 'நா', 'ணா', 'லா', 'ளா', 'ழா', 'ரா', 'றா', 'னா', 'வை', 'கை', 'போ', 'நீ', 'என்', 'அம்', 'இல்', 'உம்', 'டை', 'ப்பு'],
    words: [['காபி', '咖啡'], ['தேநீர்', '茶'], ['சாதம்', '米饭'], ['தண்ணீர்', '水'], ['ருசி', '好吃'], ['நன்றி', '谢谢'], ['வணக்கம்', '你好'], ['விலை', '价格'], ['மலிவு', '便宜'], ['விலை உயர்வு', '贵'], ['ஆர்டர்', '订单'], ['முகவரி', '地址'], ['தொலைபேசி', '电话'], ['இன்று', '今天'], ['நாளை', '明天'], ['கடை', '店铺'], ['வாடிக்கையாளர்', '客户'], ['பொருள்', '商品'], ['தள்ளுபடி', '折扣'], ['உதவி', '帮忙'], ['மெதுவாக', '慢一点'], ['வேகமாக', '快'], ['சூடு', '热'], ['குளிர்', '冷'], ['இனிப்பு', '甜'], ['காரம்', '辣'], ['புதியது', '新鲜'], ['எளிது', '方便'], ['சரி', '正确'], ['மீண்டும்', '再一次']],
    sentenceObjects: [['குளிர் காபி', '冰咖啡'], ['குளிர் தேநீர்', '冰茶'], ['வறுத்த சாதம்', '炒饭'], ['தண்ணீர்', '水'], ['இந்த பொருள்', '这个商品'], ['என் ஆர்டர்', '我的订单'], ['விநியோக முகவரி', '收货地址'], ['தொலைபேசி எண்', '电话号码'], ['இந்த விலை', '这个价格'], ['இந்த தள்ளுபடி', '这个折扣']],
    sentencePatterns: [
      (o) => [`நான் ${o[0]} ஆர்டர் செய்ய விரும்புகிறேன்.`, `我想点${o[1]}。`],
      (o) => [`தயவு செய்து ${o[0]} கொடுங்கள்.`, `请给我${o[1]}。`],
      (o) => [`${o[0]} மிகவும் நல்லது.`, `这个${o[1]}很好。`],
      (o) => [`தயவு செய்து ${o[0]} சரிபார்க்கவும்.`, `请帮我检查${o[1]}。`],
      (o) => [`${o[0]} தயாரா?`, `${o[1]}准备好了吗？`],
      (o) => [`${o[0]} மெதுவாக சொல்ல முடியுமா?`, `可以把${o[1]}说慢一点吗？`],
      (o) => [`இன்று நான் ${o[0]} பயிற்சி செய்கிறேன்.`, `今天我练${o[1]}。`],
      (o) => [`நான் ${o[0]} தெளிவாக கேட்டேன்.`, `我听清楚${o[1]}了。`],
      (o) => [`${o[0]} க்கு நன்றி.`, `谢谢你处理${o[1]}。`],
      (o) => [`${o[0]} விலை எவ்வளவு?`, `${o[1]}多少钱？`]
    ],
    trial: ['இந்த குளிர் காபி மிகவும் நல்லது', '这杯冰咖啡很好喝']
  }
};

function flattenContentMix(contentMix) {
  return Object.entries(contentMix).flatMap(([type, count]) => Array.from({ length: count }, () => type));
}

function pick(list, index) {
  return list[index % list.length];
}

function buildSentences(bank) {
  const sentences = [];
  for (let objectIndex = 0; objectIndex < bank.sentenceObjects.length; objectIndex += 1) {
    const object = bank.sentenceObjects[objectIndex];
    for (let patternIndex = 0; patternIndex < bank.sentencePatterns.length; patternIndex += 1) {
      const [text, translation] = bank.sentencePatterns[patternIndex](object);
      sentences.push([text, translation]);
    }
  }
  return sentences;
}

function splitSegments(text, type, focus, dimensions) {
  if (type !== 'sentence') {
    return [{ text, tip: buildTip(focus, dimensions, 0) }];
  }
  const parts = String(text).split(/\s+/).filter(Boolean);
  if (parts.length <= 3) {
    return [{ text, tip: buildTip(focus, dimensions, 0) }];
  }
  const chunkSize = Math.ceil(parts.length / 3);
  return [0, 1, 2]
    .map((chunkIndex) => parts.slice(chunkIndex * chunkSize, (chunkIndex + 1) * chunkSize).join(' '))
    .filter(Boolean)
    .map((segmentText, index) => ({ text: segmentText, tip: buildTip(focus, dimensions, index) }));
}

function buildTip(focus, dimensions, index) {
  const focusText = focus && focus.length ? focus[index % focus.length] : '自然语流';
  const dimension = dimensions[index % dimensions.length];
  return `重点练 ${focusText}。${SHARED_DIMENSION_TIPS[dimension] || '先听标准范读，再模仿同样的节奏。'}`;
}

function buildHint(type, lesson, focus, dimensions) {
  const typeHint = {
    syllable: '先把单个音节读稳，再进入单词。',
    word: '先听范读，注意起音、元音和收尾。',
    sentence: '先分段跟读，再连成自然短句。'
  }[type];
  return `${typeHint}${lesson.trainingGoal}${buildTip(focus, dimensions, 0)}`;
}

function buildItem(dialect, lesson, type, itemNumber, globalIndex, bank, sentences) {
  const id = `${dialect}-${lesson.id.replace(`${dialect}-`, '')}-item-${String(itemNumber).padStart(3, '0')}`;
  let text;
  let translation;
  if (type === 'syllable') {
    text = pick(bank.syllables, globalIndex + itemNumber);
    translation = `发音音节 ${text}`;
  } else if (type === 'word') {
    [text, translation] = pick(bank.words, globalIndex + itemNumber);
  } else {
    [text, translation] = pick(sentences, globalIndex + itemNumber);
  }

  const item = {
    id,
    type,
    text,
    translation,
    hint: buildHint(type, lesson, lesson.focus, curriculumPlan[dialect].scoringDimensions),
    demoAudio: `/assets/audio/${dialect}/normal/${id}.mp3`,
    slowDemoAudio: `/assets/audio/${dialect}/slow/${id}.mp3`,
    segments: splitSegments(text, type, lesson.focus, curriculumPlan[dialect].scoringDimensions)
  };
  return normalizeItemAudio(item, dialect);
}

function buildLevelMap(dialect) {
  return {
    beginner: { id: 'beginner', name: LEVEL_NAMES.beginner, summary: LEVEL_SUMMARY.beginner, lessons: [] },
    elementary: { id: 'elementary', name: LEVEL_NAMES.elementary, summary: LEVEL_SUMMARY.elementary, lessons: [] },
    intermediate: { id: 'intermediate', name: LEVEL_NAMES.intermediate, summary: LEVEL_SUMMARY.intermediate, lessons: [] }
  };
}

function buildCatalogForDialect(dialect) {
  const meta = getLanguageMeta(dialect);
  const plan = curriculumPlan[dialect];
  const bank = BANKS[dialect];
  const sentences = buildSentences(bank);
  const levels = buildLevelMap(dialect);
  let globalIndex = 0;

  for (const lesson of plan.lessons) {
    const types = flattenContentMix(lesson.contentMix);
    const items = types.map((type, index) => {
      globalIndex += 1;
      return buildItem(dialect, lesson, type, index + 1, globalIndex, bank, sentences);
    });
    levels[lesson.levelId].lessons.push({
      id: lesson.id,
      title: lesson.title,
      summary: `${lesson.trainingGoal} 本课重点：${lesson.focus.join(' / ') || '综合语流'}。`,
      focus: lesson.focus,
      items
    });
  }

  return {
    id: dialect,
    name: meta.name,
    description: plan.marketPosition,
    previewAudio: meta.previewAudio,
    targetItems: plan.targetItems,
    levels: [levels.beginner, levels.elementary, levels.intermediate]
  };
}

function buildTrialForDialect(dialect) {
  const bank = BANKS[dialect];
  const plan = curriculumPlan[dialect];
  const id = `${dialect}-trial-1`;
  const item = {
    id,
    lessonId: `${dialect}-pronunciation-lesson-01`,
    levelId: 'beginner',
    type: 'sentence',
    text: bank.trial[0],
    translation: bank.trial[1],
    hint: `免费试练句。${plan.pronunciationCore.slice(0, 2).join('；')}。`,
    demoAudio: `/assets/audio/${dialect}/normal/${id}.mp3`,
    slowDemoAudio: `/assets/audio/${dialect}/slow/${id}.mp3`,
    segments: splitSegments(bank.trial[0], 'sentence', plan.lessons[0].focus, plan.scoringDimensions)
  };
  return normalizeItemAudio(item, dialect);
}

function buildExpandedCurriculum() {
  const catalog = {};
  const trialItems = {};
  for (const dialect of DIALECTS) {
    catalog[dialect] = buildCatalogForDialect(dialect);
    trialItems[dialect] = buildTrialForDialect(dialect);
  }
  return { catalog, trialItems };
}

function writeExpandedCurriculum(value) {
  const file = [
    '// This file is generated by backend/scripts/generate-expanded-curriculum.js.',
    '// Do not edit it by hand. Update data/curriculum-plan.js or the generator banks instead.',
    `const catalog = ${JSON.stringify(value.catalog, null, 2)};`,
    '',
    `const trialItems = ${JSON.stringify(value.trialItems, null, 2)};`,
    '',
    'module.exports = {',
    '  catalog,',
    '  trialItems',
    '};',
    ''
  ].join('\n');
  fs.writeFileSync(OUTPUT_PATH, file, 'utf8');
}

function run() {
  const expanded = buildExpandedCurriculum();
  assertCatalogShape(expanded.catalog);
  DIALECTS.forEach((dialect) => assertTrialShape(expanded.trialItems[dialect], dialect, expanded.catalog));
  writeExpandedCurriculum(expanded);
  console.log(`Expanded curriculum generated: ${OUTPUT_PATH}`);
  console.log(`Items: ${DIALECTS.map((dialect) => {
    const total = expanded.catalog[dialect].levels.flatMap((level) => level.lessons).flatMap((lesson) => lesson.items).length;
    return `${dialect}=${total}`;
  }).join(', ')}`);
}

run();
