import { PetExpression, PetSpecies, PetSpeciesInfo, PetTouchZone } from '../types';

export const STARTER_PET_SPECIES: PetSpecies[] = ['pig', 'rabbit', 'dog'];
export const PET_SPECIES_LIST: PetSpecies[] = ['pig', 'rabbit', 'dog', 'cat', 'duck', 'hamster'];

export const PET_SPECIES_INFO: Record<PetSpecies, PetSpeciesInfo> = {
  pig: {
    id: 'pig',
    label: '粉紅小豬',
    shortName: '小豬',
    emoji: '🐷',
    eggColor: '#FFB6CA',
    accentColor: '#FF7A9E',
    favoriteFoodIds: ['caramel_pudding', 'crispy_fries', 'dream_cocoa_cake'],
    greeting: '呼嚕呼嚕～今天也想吃香噴噴的點心！',
    pettedSpeech: '呼嚕呼嚕～好喜歡摸摸喔！',
    favoriteFoodReaction: '呼嚕～這是我最愛的料理，幸福度爆表！',
    zoneSpeeches: {
      head: [
        '呼嚕呼嚕～摸頭最舒服了，感覺被溫柔地誇獎了！',
        '軟軟的大耳朵動呀動～再多摸兩下嘛！',
        '頭頂暖呼呼的，今天也要當最乖的食堂小豬！',
        '被你輕輕摸著頭，一整天的煩惱都飄走囉～',
        '呼嚕… 頭頂好放鬆，差點舒服到眯起眼睛打盹了！',
        '只要你摸摸我的頭，我就覺得自己是全世界最幸福的小豬！',
        '好喜歡你的手心溫度喔～再陪我待一會兒好不好？',
        '呼嚕呼嚕～頭頂充飽元氣了！等一下想吃香噴噴的點心～',
      ],
      cheek: [
        '軟綿綿的腮幫子是不是很好捏呀～嘻嘻！',
        '粉紅小鼻子貼貼！呼嚕～好幸福喔～',
        '臉頰肉嘟嘟的，捏起來像剛出爐的棉花糖對吧？',
        '輕輕搓臉臉好害羞喔，腮幫子都要變成草莓色了！',
        '呼嚕～你的指尖軟軟的，蹭在臉上好療癒呀～',
        '臉頰Q彈有彈性，可不是貪吃才變圓的喔… 好吧有一點點！',
        '雙手捧著我的臉臉時，眼睛裡全都是你呢～',
      ],
      belly: [
        '圓滾滾肚肚被揉得好放鬆～呼嚕呼嚕～',
        '咕嚕～這不是餓，是肚子在開心唱歌！',
        '吃飽飽的小肚皮最療癒了，靠著一起休息一下吧～',
        '哈哈好癢喔～揉肚肚的時候人家會忍不住扭來扭去！',
        '這裡面裝滿了美味點心，還有對你滿滿的喜歡喔～',
        '暖烘烘的粉紅小肚皮，是專屬你的減壓抱枕！',
        '輕輕畫圈按摩肚肚，感覺整隻豬都要融化成布丁了～',
      ],
      paw: [
        '粉紅小手手跟你擊掌！今天一起元氣滿滿！',
        '牽緊緊～不管去散步還是去食堂都要一起喔！',
        '小短手努力比一個愛心送給你 🩷',
        '碰碰軟Q的小蹄子，把今天的好運分給你一半！',
        '牽住你的手指就覺得好安心，什麼都不怕了～',
        '小豬擊掌一百分！我們是最有默契的好搭檔！',
      ],
    },
  },
  rabbit: {
    id: 'rabbit',
    label: '棉花糖小兔',
    shortName: '小兔',
    emoji: '🐰',
    eggColor: '#C5F0DF',
    accentColor: '#5CC9A7',
    favoriteFoodIds: ['carrot_salad', 'fruit_box', 'morning_brunch_plate'],
    greeting: '啾啾～最喜歡脆脆的紅蘿蔔和香甜水果盒！',
    pettedSpeech: '耳朵軟綿綿～被你摸摸好開心啾！',
    favoriteFoodReaction: '咔滋咔滋！是我最愛的紅蘿蔔與果香啾！',
    zoneSpeeches: {
      head: [
        '長耳朵最喜歡被輕輕順毛了啾～好溫柔！',
        '頭頂被摸得暖呼呼的，差點舒服到打瞌睡啾～',
        '兔耳豎得高高的，代表我現在心情一百分！',
        '從頭頂一路順到耳尖，這是最神奇的快樂魔法啾～',
        '啾～被摸摸頭的時候，感覺心裡像晴天一樣亮晶晶的！',
        '輕輕撫摸我的耳朵，疲憊一下子就全都消散囉～',
        '今天的你也很努力了對吧？換小兔靠著你給你加油啾！',
        '頭頂軟綿綿的毛毛，只有最信任的你才能摸個夠喔～',
      ],
      cheek: [
        '臉頰鼓鼓像棉花糖對不對？才沒有偷藏紅蘿蔔啦！',
        '輕輕點我的小鼻尖好癢喔～啾咪！',
        '腮幫子被搓得好害羞，臉都紅撲撲了啾～',
        '小鬍鬚跟著一顫一顫的，這就是開心的暗號喔！',
        '臉貼臉的時候最溫暖了，感覺像被云朵包住一樣啾～',
        '軟呼呼的小臉頰任你捏，但要記得給一顆小草莓當獎勵喔！',
        '被摸著臉臉時，心情就像吃到水嫩脆甜的水果一樣幸福！',
      ],
      belly: [
        '呼哇～揉肚肚好癢呀哈哈哈！再輕一點點啾～',
        '白白軟軟的麻糬肚肚，只有最喜歡的人能摸喔！',
        '揉完肚肚感覺又可以多吃一盒水果盒了啾！',
        '兔肚肚像剛曬過太陽的羽絨被，暖洋洋的對吧？',
        '咕嚕啾～肚肚被順毛摸著，整隻兔都要變成一顆小白糰子了！',
        '輕輕揉一揉小肚子，感覺所有不開心都被收進口袋裡變不見啦！',
        '哎呀～再揉下去小兔要翻肚皮睡著了啾 zzz',
      ],
      paw: [
        '軟綿綿的小兔掌給你握緊緊～好溫暖啾！',
        '碰碰幸運肉球，今天一定會有好事發生！',
        '牽牽手手，要帶我去農場看看紅蘿蔔了嗎？',
        '小兔爪輕輕搭在你手背上，把甜滋滋的好心情傳給你～',
        '雙手拍拍！不管今天累不累，小兔永遠站在你這邊啾！',
        '偷偷把小幸運塞進你手心裡，記得收好喔～',
      ],
    },
  },
  dog: {
    id: 'dog',
    label: '奶油小狗',
    shortName: '小狗',
    emoji: '🐶',
    eggColor: '#FFE099',
    accentColor: '#E6A222',
    favoriteFoodIds: ['meat_bento', 'cheese_burger', 'moon_croissant'],
    greeting: '汪汪！今天也要吃肉肉便當再一起去散步！',
    pettedSpeech: '尾巴搖不停～最喜歡你了汪！',
    favoriteFoodReaction: '汪嗚！太香太好吃了，尾巴搖成螺旋槳！',
    zoneSpeeches: {
      head: [
        '摸頭就是最棒的獎勵對吧！尾巴搖成電風扇汪！',
        '最喜歡主人摸我的垂垂大耳朵了汪嗚～',
        '乖寶寶被誇獎了！是不是還可以順便吃點心？',
        '只要頭頂有你的手手，我就覺得好踏實好安心汪！',
        '呼嚕汪～你手心好暖喔，我可以再靠過來一點點嗎？',
        '不管你在外頭多辛苦，回家都可以盡情摸摸我的頭充電汪！',
        '耳朵垂垂的聽你說話，今天也是最愛主人的一天！',
        '被摸頭瞬間電力滿格！隨時準備陪你衝去公園散步汪！',
      ],
      cheek: [
        '臉頰肉超彈超好揉吧～隨便你捏汪！',
        '濕潤潤的小鼻子跟你的指尖打招呼汪！',
        '被雙手捧著臉臉好幸福，永遠黏著你汪～',
        '奶油色腮幫子越揉越鬆軟，像剛烤好的奶油麵包對吧？',
        '蹭蹭你的掌心～有你在身邊就是最治癒的時光汪！',
        '輕輕搔搔下巴跟臉側，我都要露出傻呼呼的笑臉了汪～',
        '把整個小臉埋進你手裡，世界上哪裡都比不上這裡舒服！',
      ],
      belly: [
        '立刻翻肚肚給你摸摸！這是最信任你的表現汪～',
        '肚皮被搓得好酥麻，後腳都要跟著踢兩下了汪！',
        '揉揉暖呼呼的小肚子，準備迎接下頓大餐！',
        '嗚哇～這個抓肚肚的角度太剛好了，舒服到想哼歌汪～',
        '肚子暖暖軟軟的，難過的時候就靠著我休息吧汪！',
        '四腳朝天給你盡情揉揉，今天的治癒能量由我負責提供！',
        '揉肚肚五分鐘，煩惱通通清零！要不要再多摸一下汪？',
      ],
      paw: [
        '握手手大成功！我是食堂最聰明的小狗汪！',
        '擊掌！Give me five 汪汪～今天也很棒！',
        '把小手手放在你掌心，散步的時候牽緊緊喔！',
        '粉嫩小肉球蓋章認證：你今天做得超級好汪！',
        '左腳換右腳，每天最期待的就是跟你玩握手遊戲！',
        '牽住你的手就不想放開，要一直一起走下去喔汪～',
      ],
    },
  },
  cat: {
    id: 'cat',
    label: '蜜桃橘貓',
    shortName: '小貓',
    emoji: '🐱',
    eggColor: '#FFD6B8',
    accentColor: '#EA8C55',
    favoriteFoodIds: ['caramel_pudding', 'blueberry_tart', 'cocoa_mint_latte'],
    greeting: '喵嗚～本喵剛好有空，快端出香甜的點心吧！',
    pettedSpeech: '呼嚕呼嚕… 勉強讓你再多摸兩下喵～',
    favoriteFoodReaction: '喵～這味道真優雅，本喵給你滿分評價！',
    zoneSpeeches: {
      head: [
        '喵～耳根後面抓抓最舒服了，呼嚕呼嚕停不下來…',
        '嗯哼，你的摸頭技術還算及格啦喵～',
        '輕輕順著額頭的貓咪花紋摸，心情整個都軟綿綿了喵！',
        '只有特別喜歡的人，本喵才准你碰頭頂喔～',
        '尾巴尖輕輕勾著你的手腕，這是貓咪最高級的示好喵！',
        '呼嚕呼嚕… 再多摸一會兒，本喵就大方借你靠著休息吧！',
      ],
      cheek: [
        '喵嗚～下巴和腮幫子搔一搔，眼睛都要眯成月牙了！',
        '輕輕用臉頰蹭你的手心，這可是幫你蓋上本喵的專屬氣味章喔～',
        '鬍鬚抖抖～才不是害羞，是室內太溫暖了啦喵！',
        '軟呼呼的小貓腮幫子，捏起來比麻糬還精緻對吧？',
      ],
      belly: [
        '喵！肚皮可是禁區… 好吧，如果是你就可以摸一下下！',
        '呼嚕… 溫暖的肚子剛好適合窩在陽光下打盹呢～',
        '軟綿綿的貓肚皮，摸著是不是覺得整天壓力都融化了喵？',
        '哼哼，再揉下去本喵就要原地攤平變成一攤貓餅乾囉～',
      ],
      paw: [
        '粉嫩山竹小肉球輕輕踩踩你的手背～喵！',
        '握住我軟綿綿的貓掌，今天的好運由本喵承包了喵！',
        '舉起貓爪打招呼，待會記得幫本喵多拍幾張美照喔📸',
        '小貓掌按在掌心上，一起散發優雅又幸福的氣場吧～',
      ],
    },
  },
  duck: {
    id: 'duck',
    label: '陽光小鴨',
    shortName: '小鴨',
    emoji: '🐥',
    eggColor: '#FFF0A8',
    accentColor: '#F4A62A',
    favoriteFoodIds: ['fruit_box', 'pumpkin_soup', 'morning_brunch_plate'],
    greeting: '嘎嘎～今天陽光真好，想在庭院多交幾個新朋友！',
    pettedSpeech: '嘎嘎！被你摸摸羽毛變得蓬鬆又亮晶晶～',
    favoriteFoodReaction: '嘎呼！！這道料理超爽口，翅膀都要拍飛起來啦！',
    zoneSpeeches: {
      head: [
        '嘎嘎～頭頂的小呆毛翹起來了，代表今天會遇見可愛訪客喔！',
        '順順頭頂的黃色絨毛，感覺整隻鴨像小太陽一樣暖呼呼！',
        '嘎～最喜歡你輕輕點我的頭頂了，像在打快樂的節拍！',
        '摸摸頭充飽元氣！待會要去庭院巡邏迎接客人嘎嘎～',
        '頭頂軟綿綿的羽毛，是剛曬過暖陽的鬆軟觸感喔！',
        '只要你在身邊，小鴨每天都覺得開心到想跳踢踏舞嘎！',
      ],
      cheek: [
        '圓嘟嘟黃色小臉頰蹭蹭你的掌心嘎～',
        '扁扁橘色小嘴巴輕輕啾一下你的手指，好癢對吧嘎嘎！',
        '被雙手捧著小鴨臉好幸福，整個視野都是最喜歡的你～',
        '臉頰暖洋洋的，像剛出爐的奶油小餐包一樣可愛嘎！',
      ],
      belly: [
        '咕嚕嘎～圓滾滾的小鴨肚皮像羽絨枕頭一樣澎鬆吧！',
        '哈哈哈揉肚肚好癢喔！翅膀要忍不住拍拍拍了嘎嘎～',
        '吃飽飽的小肚子貼著地面好涼爽，再陪我窩一下嘛！',
        '軟綿綿的肚肚裡面裝滿了陽光跟好心情喔嘎！',
      ],
      paw: [
        '啪嗒啪嗒！橘色小鴨掌跟你擊掌，今天一起大步向前走嘎！',
        '小翅膀輕輕抱住你的手指，不準偷偷離開小鴨喔～',
        '搖搖擺擺牽手散步去！庭院裡好像有新朋友在等我們呢！',
        '翅膀比一個大大的愛心送給你 💛 嘎嘎！',
      ],
    },
  },
  hamster: {
    id: 'hamster',
    label: '蓬蓬小倉鼠',
    shortName: '小倉鼠',
    emoji: '🐹',
    eggColor: '#FCE1B6',
    accentColor: '#D98A4E',
    favoriteFoodIds: ['butter_cookie', 'sunflower_bento', 'dried_fruit'],
    greeting: '吱吱～今天也要把可愛的小點心塞滿臉頰！',
    pettedSpeech: '吱吱吱～被摸摸感覺像在滾輪上幸福旋轉！',
    favoriteFoodReaction: '吱！！香脆又甜的美味！腮幫子都塞成愛心形狀了～',
    zoneSpeeches: {
      head: [
        '吱吱～圓圓的小耳朵動呀動，最喜歡你的溫柔順毛了！',
        '用指腹輕輕摸摸頭頂，小倉鼠舒服到都要化在掌心裡了吱～',
        '焦糖色的軟軟背毛順過去，心情立刻變成一百分！',
        '吱～只要你一直摸著我，我就能安安心心睡個甜美小覺～',
        '小倉鼠雖然小小隻，但對你的喜歡可是大大的喔吱吱！',
        '頭頂充飽元氣！今天也會幫你多抱幾個好食材回來喔🌻',
      ],
      cheek: [
        '腮幫子鼓鼓的才不是發胖，是偷偷替你存了滿滿幸福跟葵花籽吱！',
        '吱嗚～輕輕點點肉肉的小臉頰，像軟綿綿的麻糬對吧？',
        '臉頰揉起來Q彈軟嫩，被你捧著感覺自己是世界上最珍貴的小寶貝～',
        '小鼻子一抽一抽嗅嗅你的味道，最喜歡和你貼貼了吱！',
      ],
      belly: [
        '白白軟軟的小肚肚翻過來給你摸～好害羞呀吱吱！',
        '揉揉小肚子就像揉一顆剛出爐的牛奶小湯圓，暖呼呼的～',
        '哈哈哈不要搔肚臍啦好癢吱吱吱！但好開心喔！',
        '吃完小餅乾窩在你掌心揉肚肚，是倉鼠界最奢侈的享受～',
      ],
      paw: [
        '粉嫩小小手抓緊你的指尖！我會努力跟上你的腳步吱～',
        '用迷你小手手幫你加油打氣！今天一定也能收集到滿滿食材！',
        '雙手舉高高求抱抱～把小小的身體放進你溫暖的掌心吧吱！',
        '迷你肉球蓋個章，約定好每天都要一起開心吃點心喔🌻',
      ],
    },
  },
};

const MOOD_BONUS_SPEECHES: Record<PetSpecies, { high: string[]; low: string[] }> = {
  pig: {
    high: [
      '今天心情超好！整個食堂都在閃閃發亮呢～呼嚕！',
      '有你陪在身邊的每一秒，都是最香甜的蜜糖時光！',
    ],
    low: [
      '呼嚕… 剛剛有點小孤單，幸好你來摸摸我了！',
      '被抱抱摸摸以後心情變好多了，再多陪陪我嘛～',
    ],
  },
  rabbit: {
    high: [
      '心情像灑滿糖粉的草莓蛋糕一樣甜滋滋啾～',
      '今天開心到耳朵都想跟著跳舞了啾啾！',
    ],
    low: [
      '啾… 剛剛心裡有點悶悶的，謝謝你溫柔地安慰我！',
      '只要聞到你身上的味道，小兔就覺得安心多了啾～',
    ],
  },
  dog: {
    high: [
      '今天是滿分級的好日子！尾巴搖到停不下來汪！',
      '和最喜歡的主人待在一起，幸福值直接破表汪嗚！',
    ],
    low: [
      '嗚汪… 有點想你了，摸摸我我馬上就能打起精神！',
      '謝謝你來陪我，被你撫摸一下下我就重新充滿勇氣啦汪！',
    ],
  },
  cat: {
    high: [
      '今天心情超棒喵～要不要一起來拍幾張美美的合照呢？',
      '呼嚕呼嚕… 待在你身邊的陽光下真是全天下最棒的時光喵！',
    ],
    low: [
      '喵嗚… 剛剛有點無聊，幸好你終於來陪本喵了！',
      '輕輕摸摸我的背，心情很快就放晴囉喵～',
    ],
  },
  duck: {
    high: [
      '嘎嘎～今天心情好到像在池塘開派對，肯定會有好多訪客來玩！',
      '翅膀輕飄飄的，因為有你每天這麼疼愛小鴨呀嘎！',
    ],
    low: [
      '嘎… 剛剛羽毛有點垂垂的，謝謝你溫柔地抱抱我！',
      '被你摸摸之後又充滿陽光活力啦！一起去庭院走走嘎～',
    ],
  },
  hamster: {
    high: [
      '吱吱！今天開心到在心裡轉了十圈滾輪，還存了好多好心情！',
      '和你一起待在食堂，每天都像在吃香酥餅乾一樣幸福吱～',
    ],
    low: [
      '吱… 剛剛躲在角落有點寂寞，被你捧起來馬上就暖呼呼了！',
      '謝謝你的溫柔摸摸，小倉鼠重新補滿元氣囉吱吱！',
    ],
  },
};

export const TOUCH_ZONE_META: Record<
  PetTouchZone,
  {
    feedbacks: { text: string; emoji: string }[];
    expressions: PetExpression[];
  }
> = {
  head: {
    feedbacks: [
      { text: '好喜歡摸頭！', emoji: '✨' },
      { text: '乖寶寶最棒！', emoji: '🌟' },
      { text: '耳朵軟綿綿～', emoji: '🩷' },
      { text: '頭頂暖呼呼！', emoji: '☀️' },
      { text: '治癒能量+1', emoji: '💫' },
      { text: '開心眯眯眼～', emoji: '💛' },
    ],
    expressions: ['sparkle', 'happyTongue', 'wink'],
  },
  cheek: {
    feedbacks: [
      { text: '臉頰軟Q～', emoji: '😳' },
      { text: '捏捏小臉！', emoji: '💕' },
      { text: '害羞臉紅紅', emoji: '🍓' },
      { text: '棉花糖臉蛋！', emoji: '☁️' },
      { text: '貼貼最幸福～', emoji: '🩷' },
      { text: '臉頰彈潤潤！', emoji: '✨' },
    ],
    expressions: ['shy', 'wink', 'happyTongue'],
  },
  belly: {
    feedbacks: [
      { text: '肚肚好癢！', emoji: '😆' },
      { text: '圓滾好舒服～', emoji: '🍮' },
      { text: '幸福咕嚕嚕', emoji: '💛' },
      { text: '暖呼呼肚皮！', emoji: '🫧' },
      { text: '翻肚肚撒嬌～', emoji: '🌟' },
      { text: '軟綿麻糬肚！', emoji: '🍡' },
    ],
    expressions: ['ticklish', 'happyTongue', 'sparkle'],
  },
  paw: {
    feedbacks: [
      { text: '握手手成功！', emoji: '🐾' },
      { text: '擊掌 High Five！', emoji: '🙌' },
      { text: '牽牽小手手', emoji: '💞' },
      { text: '肉球蓋章！', emoji: '🌸' },
      { text: '好搭檔認證！', emoji: '⭐' },
    ],
    expressions: ['wink', 'sparkle', 'happyTongue'],
  },
};

export function getPetSpeciesInfo(species: PetSpecies): PetSpeciesInfo {
  return PET_SPECIES_INFO[species] ?? PET_SPECIES_INFO.pig;
}

export function pickRandomNonRepeating<T>(items: T[], lastItem?: T): T {
  if (items.length <= 1) return items[0];
  const candidates = lastItem !== undefined ? items.filter((item) => item !== lastItem) : items;
  const pool = candidates.length > 0 ? candidates : items;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function getRandomZoneSpeech(
  species: PetSpecies,
  zone: PetTouchZone,
  mood?: number,
  lastSpeech?: string
): string {
  const speciesInfo = getPetSpeciesInfo(species);
  const baseLines = speciesInfo.zoneSpeeches[zone];
  const bonus = MOOD_BONUS_SPEECHES[species] ?? MOOD_BONUS_SPEECHES.pig;

  let pool = [...baseLines];
  if (typeof mood === 'number') {
    if (mood >= 80) {
      pool = [...pool, ...bonus.high];
    } else if (mood <= 45) {
      pool = [...pool, ...bonus.low];
    }
  }

  return pickRandomNonRepeating(pool, lastSpeech);
}

