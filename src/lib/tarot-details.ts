// src/lib/tarot-details.ts
// Richer static text per card, keyed by TarotCard.id:
//   upLong / revLong — a full paragraph for the card detail view
//   lore             — imagery, symbolism and history of the card
// One-line readings come from tarot-meanings.ts (getCardOneLiner).

type Text = { en: string; zh: string };

export interface CardDetailText {
  upLong: Text;
  revLong: Text;
  lore: Text;
}

export const CARD_DETAILS: Record<string, CardDetailText> = {
  "major-00": {
    upLong: {
      zh: "愚者站在悬崖边，眼望天空，行囊轻便。他代表一种不被经验束缚的开放：你不需要把一切都想清楚才能出发。这张牌邀请你相信直觉与时机，带着好奇去尝试，允许自己做一个初学者。最大的风险往往不是失败，而是因为害怕而从未开始。",
      en: "The Fool stands at a cliff’s edge, eyes on the sky, carrying almost nothing. He is openness not yet weighed down by experience: you don’t need every answer before setting out. Trust timing and instinct, try things with curiosity, and allow yourself to be a beginner. The bigger risk is often never starting at all.",
    },
    revLong: {
      zh: "逆位的愚者提醒两种失衡：一种是不看路就跳，把冲动当成勇气，忽略了真实的风险；另一种正好相反，因为害怕犯错而原地踏步，迟迟不敢开始。先分辨自己属于哪一种，再往反方向调整：要么慢下来做点准备，要么放下完美主义，迈出第一步。",
      en: "Reversed, the Fool points to one of two imbalances: leaping without looking and mistaking impulse for courage, or freezing because you’re afraid of getting it wrong. Notice which one is yours and correct the other way: slow down and prepare, or drop the perfectionism and take the first step.",
    },
    lore: {
      zh: "在韦特牌中，愚者编号为 0，不在序列之内，却可以出现在任何地方，因此常被看作整套大阿卡纳的主角，后面 21 张牌就是他一路遇到的课题，这条路线被称为「愚者之旅」。画面里的白玫瑰象征纯真，脚边的小白狗被解读为本能或忠告。在更早的意大利塔罗中，愚者往往是个衣衫褴褛的流浪者，远没有这样轻盈明亮。",
      en: "Numbered 0 in the Rider–Waite deck, the Fool stands outside the sequence yet can appear anywhere, so he is often read as the hero of the Major Arcana; the other 21 cards are the lessons on his road, known as the “Fool’s Journey”. The white rose stands for innocence, and the little dog is read as instinct or warning. In older Italian decks the Fool was usually a ragged vagabond, far less bright and carefree.",
    },
  },
  "major-01": {
    upLong: {
      zh: "魔术师一手指天、一手指地，象征把灵感落实为现实。桌上摆着权杖、圣杯、宝剑和星币，代表你已经拥有所需的各种资源：热情、情感、思考和实际条件。这张牌说的是专注与主动：机会就在眼前，关键是集中意志，把想法变成第一个具体的行动。",
      en: "One hand raised to the sky and one pointing to the earth, the Magician channels inspiration into the material world. On his table lie a wand, a cup, a sword and a pentacle: passion, feeling, thought and practical means. You already have what you need. The key is focus and initiative: turn the idea into its first concrete action.",
    },
    revLong: {
      zh: "逆位时，力量还在，只是用偏了。可能是精力分散在太多事情上，什么都开了头却没有完成；也可能是能力被闲置，迟迟没有发挥。还有一层提醒：小心操控和花言巧语，包括别人对你说的，以及你对自己说的那些方便的借口。",
      en: "Reversed, the power is still there but misdirected. Energy may be scattered across too many starts, or real ability may be sitting unused. It can also warn of manipulation and smooth talk, both from others and in the convenient stories you tell yourself.",
    },
    lore: {
      zh: "早期塔罗里，这张牌叫「Il Bagatto」，形象是街头摆摊变戏法的艺人，带着一点江湖骗子的意味。到了十九世纪的神秘学传统中，他才被重新塑造成掌握四元素的魔法师。韦特牌中，他头顶的无限符号「∞」和腰间衔尾蛇形状的腰带，都象征无尽的能量与循环。黄金黎明体系将他对应水星，主管沟通与技巧。",
      en: "In early tarot this card was “Il Bagatto”, a street conjurer with a hint of the con artist. Nineteenth-century occultists recast him as a magus commanding the four elements. In the Rider–Waite image, the infinity sign above his head and the belt shaped like a snake biting its tail both suggest endless energy and renewal. The Golden Dawn assigned him Mercury, ruler of communication and skill.",
    },
  },
  "major-02": {
    upLong: {
      zh: "祭司安静地坐在两根柱子之间，身后的帷幕遮住了更深处的东西。她代表直觉、潜意识和尚未说出口的知晓。这张牌出现时，往往不是马上行动的时机，而是先观察、倾听、等待。你可能已经隐约知道答案，只是需要安静下来才能听清。",
      en: "The High Priestess sits quietly between two pillars, a veil hiding what lies behind her. She stands for intuition, the unconscious and knowledge not yet spoken. This is rarely a moment for action; it is a time to watch, listen and wait. You may already sense the answer and only need enough quiet to hear it.",
    },
    revLong: {
      zh: "逆位时，内在的声音被淹没了：太多外界的意见、太多信息，或者你刻意不去面对心里的感觉。也可能有些事情被隐瞒，真相还没有浮出水面。给自己留一点独处的时间，别急着用道理说服自己忽略那份不安。",
      en: "Reversed, your inner voice is being drowned out by too many opinions, too much input, or a feeling you would rather not face. Something may also be hidden, its truth not yet surfaced. Give yourself time alone, and don’t argue yourself out of an unease too quickly.",
    },
    lore: {
      zh: "这张牌在早期意大利塔罗中叫「女教皇」（La Papessa），常被联系到中世纪关于女教皇琼安的传说。韦特牌把她改成了更神秘的祭司形象：两根柱子上刻着 B 和 J，取自所罗门圣殿的两根柱子；她怀中半露的卷轴写着「TORA」，脚下是一弯新月，都指向隐藏的知识与直觉的力量。黄金黎明体系将她对应月亮。",
      en: "In early Italian decks she was “La Papessa”, the female Pope, often linked to the medieval legend of Pope Joan. Waite reshaped her as a mysterious priestess: the pillars marked B and J come from Solomon’s Temple, the scroll in her lap reads “TORA”, and a crescent moon lies at her feet, all pointing to hidden knowledge and the power of intuition. The Golden Dawn assigned her the Moon.",
    },
  },
  "major-03": {
    upLong: {
      zh: "皇后坐在丰茂的麦田与森林之间，是丰饶、创造和滋养的化身。这张牌代表一切需要时间与耐心才能长成的东西：一段关系、一个作品、身体，或者你自己。它鼓励你享受感官和生活本身的美好，相信用心浇灌的事物会慢慢开花结果。",
      en: "Seated among ripe wheat and forest, the Empress embodies abundance, creativity and care. She governs everything that grows with time and patience: a relationship, a creative work, the body, yourself. Enjoy the senses and the simple pleasures of life, and trust that what you tend will bloom.",
    },
    revLong: {
      zh: "逆位的皇后常指向枯竭：创造力卡住了，或者你一直在照顾别人，自己却被掏空。也可能是过度依赖、过度保护，让关系变得窒息。先把自己当作需要照料的那块田，好好休息，做点只为自己开心的事，丰盛才会回来。",
      en: "Reversed, the Empress often signals depletion: a creative block, or caring for everyone except yourself. It can also mean smothering or dependence in a relationship. Treat yourself as the field that needs tending: rest, do something purely for your own joy, and abundance will return.",
    },
    lore: {
      zh: "皇后的盾牌上刻着金星符号「♀」，在黄金黎明体系里她对应金星，象征爱、美与丰收。她头戴十二颗星的冠冕，长裙上布满石榴图案，身边的麦田和流水呼应大地母亲的形象。在塔罗序列里，她和皇帝是一对：一个代表孕育，一个代表秩序。",
      en: "Her shield bears the symbol of Venus, the planet the Golden Dawn assigned to her: love, beauty and harvest. She wears a crown of twelve stars and a gown patterned with pomegranates, and the wheat and stream around her echo the Earth Mother. In the sequence she pairs with the Emperor: one nurtures, the other orders.",
    },
  },
  "major-04": {
    upLong: {
      zh: "皇帝端坐在石头王座上，背后是荒凉的群山。他代表秩序、规则、责任和长期的稳定。这张牌提醒你用结构解决混乱：订计划、设边界、做决定并承担后果。它也可能指向生活中的权威人物，或者说明你需要成为那个能扛事、能拍板的人。",
      en: "The Emperor sits on a stone throne against bare mountains. He stands for order, rules, responsibility and lasting stability. Meet chaos with structure: make the plan, set the boundary, decide and own the outcome. He may also point to an authority figure in your life, or to your need to become the one who takes charge.",
    },
    revLong: {
      zh: "逆位时，控制变成了问题：要么过于僵硬、专断，听不进别人的意见；要么缺乏纪律，计划一再拖延，没人真正负责。也可能是你和某个权威人物关系紧张。找回平衡的关键在于记住：规则是为了让事情运转，而不是为了证明谁说了算。",
      en: "Reversed, control becomes the problem: rigid and domineering and deaf to others, or so loose that plans slip and no one is truly responsible. It may also show tension with an authority figure. Remember that rules exist to make things work, not to prove who is in charge.",
    },
    lore: {
      zh: "皇帝的王座上雕着四个公羊头，因为黄金黎明体系把这张牌对应给白羊座，象征开创与意志力。他手持顶端为安卡十字的权杖和金球，代表对生命与世界的统治。长袍之下露出盔甲，暗示他的权力建立在随时准备守护的力量之上。",
      en: "Four ram heads decorate his throne, because the Golden Dawn assigned this card to Aries: initiative and will. He holds an ankh-topped sceptre and an orb, signs of rule over life and the world. Armour shows beneath his robe; his authority rests on a readiness to defend.",
    },
  },
  "major-05": {
    upLong: {
      zh: "教皇坐在神殿中，面前跪着两位信徒，他代表传统、制度、学习与传承。这张牌出现时，跟随成熟的方法往往比独自摸索更有效：找一位导师、上一门课、遵循行业惯例，或者回到你所属的群体中寻找支持。它也可能与仪式、婚礼和共同的价值观有关。",
      en: "Seated in a temple before two kneeling followers, the Hierophant represents tradition, institutions, learning and lineage. Following a proven path often works better than inventing your own right now: find a mentor, take a course, follow good practice, or lean on your community. It can also speak of ceremonies, weddings and shared values.",
    },
    revLong: {
      zh: "逆位的教皇让你重新审视那些「本来就该这样」的规则。也许某个传统已经不适合你，或者你一直在按别人的期待生活。这不一定意味着反叛，而是去分辨哪些规矩真的有道理，哪些只是习惯，然后为自己的选择负责。",
      en: "Reversed, the Hierophant asks you to re-examine what you think “should” be done. A tradition may no longer fit, or you may be living by other people’s expectations. This isn’t rebellion for its own sake; it means sorting the rules that hold up from those that are mere habit, and owning your own choice.",
    },
    lore: {
      zh: "早期塔罗中这张牌就叫「教皇」（Il Papa），与女教皇相对。韦特版本里，他头戴三重冠，脚下放着两把交叉的钥匙，常被解读为通往天上与人间知识的钥匙。英文名 Hierophant 原指古希腊秘仪中向信徒揭示神圣奥秘的祭司。黄金黎明体系将它对应金牛座，象征稳定与延续。",
      en: "Early decks called him simply “Il Papa”, the Pope, partner to the Papess. In the Rider–Waite image he wears a triple crown, with two crossed keys at his feet, read as the keys to heavenly and earthly knowledge. “Hierophant” originally meant the priest who revealed sacred mysteries in ancient Greek rites. The Golden Dawn gave him Taurus: stability and continuity.",
    },
  },
  "major-06": {
    upLong: {
      zh: "恋人这张牌不只关于爱情，更关于选择。画面里天使在上方祝福一对男女，象征身心与价值观的和谐。它出现时，可能是一段真诚的关系正在加深，也可能是你面临一个重要的决定：选你真正认同的，而不是看起来最安全的那一个。",
      en: "The Lovers is as much about choice as about romance. An angel blesses a man and a woman below: harmony of body, heart and values. It may mark a sincere bond deepening, or an important decision in front of you. Choose what you truly stand behind, not merely what looks safest.",
    },
    revLong: {
      zh: "逆位时，和谐出现了裂缝：可能是关系中的价值观分歧、沟通不畅，也可能是你内心有两个声音在拉扯。还有一种情况是逃避选择，希望事情自己解决。诚实面对自己真正想要什么，关系或决定才能重新对齐。",
      en: "Reversed, the harmony cracks: values diverging in a relationship, poor communication, or two voices pulling against each other inside you. You may also be avoiding a choice and hoping it resolves itself. Getting honest about what you actually want is how things realign.",
    },
    lore: {
      zh: "在马赛塔罗中，这张牌画的是一个年轻人站在两位女子之间，头顶有丘比特拉弓，主题明显是「抉择」。韦特牌把画面改成伊甸园中的亚当与夏娃：男子身后是生命之树，女子身后是缠着蛇的智慧之树。黄金黎明体系将它对应双子座，强调两者之间的结合与沟通。",
      en: "In the Tarot de Marseille a young man stands between two women while Cupid takes aim above him; it is clearly a card of choosing. Waite’s deck turns it into Adam and Eve in Eden, with the Tree of Life behind him and the serpent-wound Tree of Knowledge behind her. The Golden Dawn linked it to Gemini, the union and dialogue of two.",
    },
  },
  "major-07": {
    upLong: {
      zh: "战车上的人身披盔甲，前方是一黑一白两只斯芬克斯，它们各有方向，却被他用意志统一起来。这张牌象征决心、自律和胜利。当你有清晰的目标并全力投入时，内在的矛盾和外在的阻碍都可以被驾驭。现在是行动和坚持的时候。",
      en: "An armoured figure rides a chariot drawn by a black sphinx and a white one. Each pulls its own way, yet his will holds them together. The Chariot stands for determination, self-discipline and victory. With a clear aim and full commitment, both inner conflict and outside obstacles can be steered. Now is the time to act and persist.",
    },
    revLong: {
      zh: "逆位的战车说明力量在互相抵消：目标太多、方向不定，或者靠蛮力硬推，结果原地打转。也可能是你感觉失去了掌控。先停下来确认要去哪里，再决定怎么走。有时候松开一点，反而走得更稳。",
      en: "Reversed, the forces cancel each other out: too many goals, no clear direction, or sheer force that only spins the wheels. You may feel out of control. Stop and confirm where you are going before deciding how. Sometimes easing your grip steadies the ride.",
    },
    lore: {
      zh: "早期塔罗的战车多是凯旋游行中的车驾，来自文艺复兴时期意大利的凯旋队列传统。韦特牌用两只斯芬克斯取代了传统的马匹，象征相反的力量；车上的人没有握缰绳，靠的是意志而不是蛮力。黄金黎明体系将它对应巨蟹座，坚硬的盔甲就像蟹壳，保护着柔软的内在。",
      en: "Early chariots echo the triumphal processions of Renaissance Italy. Waite replaced the traditional horses with two sphinxes, opposing forces held in balance, and the charioteer holds no reins: he steers by will rather than force. The Golden Dawn assigned Cancer; his armour is a crab’s shell guarding a soft interior.",
    },
  },
  "major-08": {
    upLong: {
      zh: "力量牌中，一位女子轻抚着狮子的嘴，没有武器，也没有挣扎。真正的力量不是压制，而是耐心、温柔和内在的笃定。这张牌说你有能力面对眼前的困难，也能驯服自己的冲动和恐惧。慢慢来，用理解代替对抗，用坚持代替爆发。",
      en: "A woman gently closes a lion’s jaws, with no weapon and no struggle. Real strength isn’t domination but patience, gentleness and inner certainty. You can face this difficulty and tame your own impulses and fears. Go slowly: meet it with understanding instead of force, and with persistence instead of outbursts.",
    },
    revLong: {
      zh: "逆位时，内在的狮子失去了引导：可能是被愤怒、焦虑或欲望牵着走，也可能是自信不足，觉得自己扛不住。对自己温柔一点并不等于纵容。承认脆弱，然后一点点找回节奏，力量会回来的。",
      en: "Reversed, the inner lion runs unguided: anger, anxiety or craving takes over, or self-doubt says you can’t cope. Being gentle with yourself isn’t indulgence. Admit the fragility, then find your rhythm again bit by bit, and the strength will return.",
    },
    lore: {
      zh: "在马赛塔罗等传统牌中，力量是第 11 号，正义是第 8 号。黄金黎明体系为了让牌序与星座的顺序对应，把两张牌对调：力量对应狮子座，正义对应天秤座，韦特牌沿用了这个顺序。画面中女子头顶的无限符号「∞」与魔术师头上的相同，暗示同源的精神力量。",
      en: "In the Marseille tradition Strength is XI and Justice is VIII. The Golden Dawn swapped them so the cards would follow the order of the zodiac, Strength to Leo and Justice to Libra, and the Rider–Waite deck kept that order. The infinity sign above the woman’s head matches the Magician’s, hinting at the same spiritual power.",
    },
  },
  "major-09": {
    upLong: {
      zh: "隐士独自站在雪山之巅，提着一盏灯，灯里是一颗六芒星。他代表退后一步、向内探索的智慧。这张牌建议你暂时远离喧嚣，给自己思考和反省的空间。答案不在更多的信息里，而在安静的沉淀中。你也可能正在成为别人的那盏灯。",
      en: "Alone on a snowy peak, the Hermit holds a lantern with a six-pointed star inside. He is the wisdom of stepping back and looking inward. Withdraw from the noise for a while and give yourself room to think. The answer isn’t in more input but in quiet reflection, and you may be becoming a light for someone else.",
    },
    revLong: {
      zh: "逆位的隐士提醒两个极端：一种是独处太久变成了孤立，把自己和别人隔开；另一种是害怕安静，总用忙碌和社交填满时间，不敢面对自己的内心。找到平衡：独处是为了更清醒地回到人群中。",
      en: "Reversed, the Hermit warns of two extremes: solitude that has hardened into isolation, or a fear of quiet that fills every hour with busyness so you never face yourself. Find the balance; solitude is meant to send you back to people with a clearer head.",
    },
    lore: {
      zh: "早期意大利塔罗中，这张牌常画的是一个拿着沙漏的老人，被看作「时间老人」，代表岁月与老去。后来沙漏渐渐变成了灯，主题也从时间转向了寻找真理。黄金黎明体系将隐士对应处女座，象征内省、分辨和安静的修行。",
      en: "Early Italian decks often showed an old man holding an hourglass, Father Time, a card of age and passing years. Over time the hourglass became a lantern, and the theme shifted from time to the search for truth. The Golden Dawn assigned the Hermit to Virgo: introspection, discernment and quiet discipline.",
    },
  },
  "major-10": {
    upLong: {
      zh: "命运之轮不停转动，提醒你一切都在变化之中。正位时，转机往往来得出乎意料：好运、新机会，或某件事突然有了进展。这张牌鼓励你抓住时机、顺势而行，同时记住，变化本身才是常态，不必把一时的高点当成永远。",
      en: "The wheel keeps turning: everything changes. Upright, a turn often comes unexpectedly as luck, an opening or sudden progress. Seize the moment and go with the current, while remembering that change itself is the constant; a high point isn’t forever.",
    },
    revLong: {
      zh: "逆位时，轮子可能转到了低处：事情不顺、计划被打乱，感觉运气不站在自己这边。但轮子从不停转，低谷同样是暂时的。与其抗拒变化，不如看看哪些事情在你的掌控之内，先把那部分做好，等待下一个转机。",
      en: "Reversed, the wheel may be at a low point: setbacks, disrupted plans, luck seemingly against you. But it never stops turning, and lows pass too. Rather than resisting the change, focus on what is in your control and tend to that while you wait for the next turn.",
    },
    lore: {
      zh: "命运之轮的形象来自中世纪广为流传的「命运女神之轮」：女神转动轮子，轮上的人时而登上王位，时而跌落尘土。韦特牌把女神换成了更神秘的符号：轮上刻着 TARO 字母和希伯来字母，四角的天使、鹰、狮子和公牛代表四位福音书作者，也对应四个固定星座。黄金黎明体系将它对应木星。",
      en: "The image comes from the medieval Wheel of Fortune: the goddess turns it, and people rise to the throne or fall into the dust. Waite replaced the goddess with esoteric symbols: the letters TARO and Hebrew letters on the wheel, and in the corners an angel, an eagle, a lion and a bull, the four Evangelists and the four fixed signs. The Golden Dawn gave it Jupiter.",
    },
  },
  "major-11": {
    upLong: {
      zh: "正义女神一手持剑、一手持天平，代表公平、真相和因果。这张牌提醒你诚实地看待事实，权衡利弊后做出清醒的决定，并为结果负责。它也常与合同、法律事务和正式的决定有关：你种下的因，会得到相应的果。",
      en: "Sword in one hand and scales in the other, Justice stands for fairness, truth, and cause and effect. Look honestly at the facts, weigh them, decide clearly and own the result. It often touches contracts, legal matters and formal decisions: what you set in motion comes back to you.",
    },
    revLong: {
      zh: "逆位的正义指向失衡：可能是你受到了不公平的对待，也可能是你在某件事上没有对自己或别人诚实，试图逃避应负的责任。看清自己在这件事中的那一份，比争论谁对谁错更能让局面回到正轨。",
      en: "Reversed, Justice points to imbalance. You may be treated unfairly, or you may not be fully honest with yourself or others and are trying to sidestep accountability. Owning your share of the situation will set things right faster than arguing over who is to blame.",
    },
    lore: {
      zh: "正义是古典「四枢德」之一，另外三项是节制、勇气和审慎。前两者在塔罗中分别化作节制牌和力量牌，唯独审慎没有对应的牌，这是塔罗史上常被讨论的谜题。韦特牌中的正义女神没有蒙眼，与常见的司法女神像不同，暗示她看得清一切。她原本是第 8 号，黄金黎明体系为对应天秤座把她调到了第 11 号。",
      en: "Justice is one of the four cardinal virtues; the others are Temperance, Fortitude and Prudence. The first two appear in tarot as Temperance and Strength, but Prudence has no card, a long-debated puzzle in tarot history. Unlike most courthouse statues, Waite’s Justice wears no blindfold: she sees clearly. Originally card VIII, she was moved to XI by the Golden Dawn to align with Libra.",
    },
  },
  "major-12": {
    upLong: {
      zh: "倒吊人倒挂在树上，表情却很平静，头部周围还有光环。这张牌说的是暂停、放手和换个角度看问题。现在硬推往往没用，不如接受暂时的停滞，从完全不同的视角重新理解处境。有时候放下执念，反而会得到意想不到的领悟。",
      en: "Hanging upside down from a tree, the Hanged Man looks calm, with a halo around his head. This card is about pausing, letting go and seeing from a new angle. Pushing won’t help now; accept the stillness and let a completely different view of the situation emerge. Release can bring unexpected insight.",
    },
    revLong: {
      zh: "逆位时，暂停变成了拖延：你可能一直在等，却不知道在等什么；或者在一段关系、一份工作里不断牺牲自己，却没有换来任何改变。问问自己：这份忍耐还有意义吗？如果没有，也许是时候放下，或者重新行动了。",
      en: "Reversed, the pause has become stalling: waiting without knowing what for, or sacrificing yourself in a relationship or a job with nothing changing. Ask whether this endurance still means anything. If not, it may be time to let go, or to move again.",
    },
    lore: {
      zh: "在文艺复兴时期的意大利，把叛徒和欠债者倒吊着画在公共墙壁上示众是一种惩罚，早期塔罗的倒吊人很可能就来自这种「羞辱画」。后来神秘学家把它重新诠释为自愿的牺牲与启悟：韦特牌中，他吊在一棵活着的 T 形树上，双腿交叉成数字 4 的形状，神情安然。黄金黎明体系将它对应水元素。",
      en: "In Renaissance Italy, traitors and debtors were painted hanging upside down on public walls as a shaming punishment, and the early Hanged Man probably came from these “shame paintings”. Occultists later reread him as voluntary sacrifice and illumination: in Waite’s deck he hangs from a living T-shaped tree, legs crossed into the figure 4, his face serene. The Golden Dawn linked him to the element of Water.",
    },
  },
  "major-13": {
    upLong: {
      zh: "死神几乎从不代表真正的死亡，它说的是结束与转化。一个阶段、一段关系或一个旧的自己正在落幕，这为新的开始腾出了空间。放手可能会痛，但硬撑着不放更痛。画面远处，太阳正从两座塔之间升起。",
      en: "Death almost never means literal death. It speaks of endings and transformation: a phase, a relationship or an old version of you is closing, which clears space for something new. Letting go may hurt, but holding on hurts more. In the distance, the sun rises between two towers.",
    },
    revLong: {
      zh: "逆位的死神说明变化正在被抵抗：明知道某件事已经结束，却还在勉强维持；或者害怕未知，宁愿困在熟悉的不适里。改变不会因为抗拒而消失，只会被拖得更久。承认结束，是迈向新开始的第一步。",
      en: "Reversed, Death shows change being resisted: keeping alive something that has clearly ended, or preferring familiar discomfort to the unknown. Resistance doesn’t stop change; it only drags it out. Acknowledging the ending is the first step into what comes next.",
    },
    lore: {
      zh: "在马赛塔罗中，第 13 号牌常常不写名字，被称为「无名之牌」。韦特牌中，死神是骑着白马、身披黑甲的骷髅骑士，手持绣着白玫瑰的黑旗。马前倒着一位国王，而主教、少女和孩童各有不同的反应，表示在死亡面前人人平等。黄金黎明体系将它对应天蝎座，象征深层的蜕变与重生。",
      en: "In the Tarot de Marseille card XIII is often left unnamed, “the nameless arcanum”. Waite’s Death is a skeleton knight in black armour on a white horse, carrying a black banner with a white rose. A king lies fallen before him while a bishop, a maiden and a child react in different ways: all are equal before death. The Golden Dawn assigned Scorpio, deep transformation and rebirth.",
    },
  },
  "major-14": {
    upLong: {
      zh: "节制天使把水在两只杯子之间缓缓倾倒，一只脚踏在水中，一只脚站在岸上。这张牌代表平衡、耐心和恰到好处的调和。它提醒你不必非此即彼，把不同的部分融合起来，按自己的节奏一点点前进，往往比急于求成更持久。",
      en: "An angel pours water slowly between two cups, one foot in the stream and one on land. Temperance is balance, patience and the right blend. You don’t have to choose one extreme: combine the different parts and move at your own steady pace. It lasts longer than rushing.",
    },
    revLong: {
      zh: "逆位时，平衡被打破了：可能是作息或情绪走了极端，也可能是工作和生活严重失衡，或者太心急而失去了耐心。回到中间，先把节奏放慢，从一件小事开始恢复规律。",
      en: "Reversed, the balance is broken: extremes in routine or mood, work crowding out life, or impatience taking over. Come back to the middle. Slow the pace and restore your rhythm, starting with one small habit.",
    },
    lore: {
      zh: "节制同样是古典四枢德之一。早期塔罗中常画成一位女子在两只罐子之间倒水，当时的人们习惯往葡萄酒里掺水饮用，这正是「节制」最直接的形象。韦特牌中，天使胸前绣着一个套在方形里的三角形，远处的小路通向一座顶着朝阳的山峰。黄金黎明体系将它对应射手座。",
      en: "Temperance is another of the cardinal virtues. Early decks showed a woman pouring between two jugs, the old custom of watering down wine and the most literal image of moderation. In Waite’s version the angel wears a triangle within a square on its chest, and a path leads to a mountain crowned by a rising sun. The Golden Dawn assigned Sagittarius.",
    },
  },
  "major-15": {
    upLong: {
      zh: "恶魔牌中，一男一女被锁链拴在恶魔的座下，但仔细看，锁链很松，他们其实可以自己取下来。这张牌讲的是执念、成瘾、物欲和不健康的依赖。它不是在审判你，而是让你看清：是什么在控制你，而你在多大程度上默许了它。",
      en: "A man and a woman are chained beneath the Devil, but look closely: the chains are loose enough to lift off. This card speaks of attachment, addiction, material craving and unhealthy dependence. It isn’t judging you; it asks what holds you, and how far you have agreed to it.",
    },
    revLong: {
      zh: "逆位的恶魔常常是好消息：你开始意识到某种束缚，并准备摆脱它，比如戒掉一个坏习惯，离开一段消耗你的关系。它也可能提醒你，问题只是被压抑了，而不是真正解决了。诚实地面对它，挣脱才会更彻底。",
      en: "Reversed, the Devil is often good news: you are seeing a bind and getting ready to leave it, such as a bad habit or a draining relationship. It can also warn that something is being suppressed rather than resolved. Face it honestly, and the release will be cleaner.",
    },
    lore: {
      zh: "恶魔牌在早期塔罗中留存的样本很少，形象直到马赛塔罗才比较固定。韦特牌中的恶魔长着羊角和蝙蝠翅膀，额头上是一颗倒五芒星，座下的一男一女也长出了角和尾巴。这个构图有意呼应恋人牌：同样是两个人，一张在天使的祝福下，一张在锁链之中。黄金黎明体系将它对应摩羯座。",
      en: "Few early examples of the Devil survive; its look only settled in the Marseille tradition. Waite’s Devil has goat horns, bat wings and an inverted pentagram on his brow, and the chained couple have grown horns and tails. The scene deliberately echoes the Lovers: the same two people, once blessed by an angel, now in chains. The Golden Dawn assigned Capricorn.",
    },
  },
  "major-16": {
    upLong: {
      zh: "闪电劈中高塔，王冠被击落，人从塔上坠下。这是塔罗中最具冲击力的牌之一，代表突然的变故、幻象的破灭和无法回避的真相。它常常让人不安，但被摧毁的往往是建立在错误基础上的东西。废墟之后，你才有机会建起更真实的结构。",
      en: "Lightning strikes the tower, the crown is blown off and figures fall. One of tarot’s most dramatic cards, it brings sudden upheaval, shattered illusions and truths that can’t be avoided. It is unsettling, but what falls is usually built on a false foundation. Only after the ruins can something truer be built.",
    },
    revLong: {
      zh: "逆位的高塔意味着变化被推迟，或以较温和的方式发生：也许你躲过了一场危机，也许你在用力撑住一个早就摇摇欲坠的局面。与其等它某天轰然倒塌，不如主动拆掉那些你已经知道不稳固的部分。",
      en: "Reversed, the upheaval is delayed or softened: a crisis narrowly avoided, or you are straining to prop up something already teetering. Rather than waiting for it to crash, dismantle the parts you already know are unsound.",
    },
    lore: {
      zh: "马赛塔罗里这张牌叫「La Maison Dieu」（神之屋），常被联系到《圣经》中巴别塔的故事：人类试图建造通天之塔，最终被摧毁。韦特牌中，从天而降的火花形如希伯来字母「Yod」，共有 22 个，正好对应大阿卡纳的数量。黄金黎明体系将它对应火星，象征突然而猛烈的力量。",
      en: "In the Tarot de Marseille it is “La Maison Dieu”, the House of God, often linked to the Tower of Babel: humanity’s tower to heaven, struck down. In the Rider–Waite image the falling sparks are shaped like the Hebrew letter Yod, and there are 22 of them, matching the number of Major Arcana. The Golden Dawn assigned Mars, sudden and violent force.",
    },
  },
  "major-17": {
    upLong: {
      zh: "高塔崩塌之后，夜空中出现了星星。一位女子跪在水边，一只罐子把水倒进池中，另一只倒在大地上。这张牌代表希望、疗愈和对未来的信心。经历了困难之后，你可以慢慢放松下来，相信自己正在被修复，前方有光。",
      en: "After the Tower falls, stars appear in the night sky. A woman kneels by the water, pouring one jug into the pool and the other onto the land. The Star is hope, healing and renewed faith in the future. After hardship you can begin to relax, trusting that you are mending and that there is light ahead.",
    },
    revLong: {
      zh: "逆位的星星说明你暂时失去了希望或信心：感到疲惫、怀疑自己，看不到努力的意义。这不代表光消失了，只是被云遮住了。从很小的事情开始，重新连接你在意的东西，也允许自己慢一点，信心会一点点回来。",
      en: "Reversed, the Star shows hope or confidence temporarily lost: weariness, self-doubt, not seeing the point of effort. The light hasn’t gone; it is behind clouds. Reconnect through small things you care about, let yourself go slowly, and faith will return little by little.",
    },
    lore: {
      zh: "星星紧接在高塔之后，在大阿卡纳的叙事中代表灾难之后的平静与重生。画面中央的大星有八个角，周围环绕着七颗小星；远处树上停着一只鸟，常被解读为象征灵魂的朱鹭。女子赤身而坐，象征毫无伪装的真实与脆弱。黄金黎明体系将它对应水瓶座。",
      en: "Coming right after the Tower, the Star is the calm and renewal after catastrophe in the story of the Major Arcana. A great eight-pointed star shines among seven smaller ones, and a bird in a distant tree is often read as an ibis, a symbol of the soul. The woman is naked: honest, unguarded, vulnerable. The Golden Dawn assigned Aquarius.",
    },
  },
  "major-18": {
    upLong: {
      zh: "月光下，一条小路穿过两座塔通向远方，狗和狼对着月亮嚎叫，龙虾从水里爬上岸。这张牌代表不确定、幻觉、焦虑和潜意识。事情可能不像表面那样，你的恐惧也可能放大了危险。别急着下结论，依靠直觉一步步走，慢慢就会看清。",
      en: "Under the moon a path runs between two towers, a dog and a wolf howl, and a crayfish crawls out of the water. The Moon is uncertainty, illusion, anxiety and the unconscious. Things may not be as they seem, and fear may be magnifying the danger. Don’t rush to conclusions; feel your way forward step by step until it clears.",
    },
    revLong: {
      zh: "逆位的月亮通常意味着迷雾开始散去：困惑的事情渐渐有了答案，被隐瞒的真相浮出水面，焦虑也慢慢平复。也可能是你终于愿意面对一直回避的恐惧。看清之后，下一步该怎么走就会清楚很多。",
      en: "Reversed, the Moon usually means the fog is lifting: confusion resolving, hidden truths surfacing, anxiety easing. You may finally be ready to face a fear you have been avoiding. Once you see clearly, the next step becomes much plainer.",
    },
    lore: {
      zh: "早期意大利塔罗中的月亮，有的画着观测天象的天文学家，有的只是一轮孤月。马赛塔罗确立了今天熟悉的构图：两只犬、两座塔和水中的甲壳动物。韦特牌延续了这一画面，把动物改成一狗一狼，象征被驯化的本性与野性；月亮上还落下形如字母「Yod」的水滴。黄金黎明体系将它对应双鱼座。",
      en: "Early Italian Moons sometimes showed astronomers studying the sky, sometimes just a lone moon. The Marseille deck fixed the now-familiar scene of two dogs, two towers and a crustacean in the water. Waite kept it but made the animals a dog and a wolf, tame nature and wild, with drops shaped like the letter Yod falling from the moon. The Golden Dawn assigned Pisces.",
    },
  },
  "major-19": {
    upLong: {
      zh: "太阳高照，一个孩子骑着白马，身后是盛开的向日葵。这是塔罗中最明亮的牌之一，代表喜悦、成功、活力和坦诚。事情会变得清晰而顺利，你可以放心展现真实的自己。享受这段好时光，也把这份温暖分享给身边的人。",
      en: "Under a blazing sun a child rides a white horse in front of tall sunflowers. One of tarot’s brightest cards, the Sun means joy, success, vitality and openness. Things become clear and go well, and you can show your real self without fear. Enjoy this good stretch and share the warmth with the people around you.",
    },
    revLong: {
      zh: "逆位的太阳并不是坏牌，阳光只是被暂时遮住了：可能是好事来得慢一些，可能是你对生活提不起劲，或者期望过高，反而忽略了已经拥有的快乐。降低一点要求，从身边的小事里重新感受温暖。",
      en: "Reversed, the Sun isn’t a bad card; the light is only partly blocked. Good news may come more slowly, your energy may be low, or your expectations so high that you overlook the joy already here. Ease your standards a little and find warmth in small things close at hand.",
    },
    lore: {
      zh: "马赛塔罗中的太阳画的是两个孩子站在矮墙前，沐浴在阳光下。韦特牌把它改成一个赤身的孩子骑着白马，手持红色旗帜，从围墙内的花园走向外面的世界，象征纯真、自由与新生的生命力。在黄金黎明体系中，这张牌对应的正是太阳本身。",
      en: "The Marseille Sun shows two children before a low wall, bathed in sunlight. Waite’s version has a naked child on a white horse carrying a red banner, riding out of the walled garden into the world: innocence, freedom and new life. In the Golden Dawn system it corresponds to the Sun itself.",
    },
  },
  "major-20": {
    upLong: {
      zh: "天使吹响号角，人们从棺木中站起，张开双臂回应。审判牌代表觉醒、反思和重生。你可能正在回顾过去，看清自己一路走来的意义，并准备好迈入新的阶段。它也像一个召唤，邀请你去做那件心里一直知道该做的事。",
      en: "An angel sounds a trumpet and people rise from their coffins, arms open in answer. Judgement is awakening, reflection and rebirth. You may be looking back, understanding what the road has meant, and getting ready for a new chapter. It is also a calling: to do the thing you have long known you should.",
    },
    revLong: {
      zh: "逆位的审判常指向过度的自我批评，或者对过去放不下，迟迟不能原谅自己。也可能是你听见了内心的召唤，却因为怀疑而没有回应。回顾过去是为了学习，而不是反复审判自己。接受它，然后往前走。",
      en: "Reversed, Judgement often points to harsh self-criticism, or an inability to forgive yourself for the past. You may hear an inner call while doubt keeps you from answering it. Look back to learn, not to keep sentencing yourself. Accept it, then move on.",
    },
    lore: {
      zh: "这张牌的画面直接来自基督教中的「最后的审判」：天使吹号，死者复活。早期意大利塔罗也把它叫作「天使」（L’Angelo）。韦特牌中，天使的号角上挂着一面白底红十字的旗帜，复活的人站在漂浮于水面的棺木中，远处是雪山。黄金黎明体系将它对应火元素。",
      en: "The image comes straight from the Christian Last Judgement: the angel’s trumpet raises the dead. Early Italian decks also called it “L’Angelo”, the Angel. In Waite’s version a white banner with a red cross hangs from the trumpet, the risen stand in coffins floating on water, and snowy mountains rise behind them. The Golden Dawn assigned it to the element of Fire.",
    },
  },
  "major-21": {
    upLong: {
      zh: "世界牌中，一位舞者在月桂花环中起舞，四角是天使、鹰、狮子和公牛。作为大阿卡纳的最后一张，它代表完成、圆满和整合：一个阶段画上了句号，你收获了经验，也变得更完整。好好庆祝，然后带着这份完整走向下一个循环。",
      en: "A dancer moves within a laurel wreath, with an angel, an eagle, a lion and a bull in the corners. As the last of the Major Arcana, the World is completion, fulfilment and integration: a chapter closes, you gather what you have learned, and you feel whole. Celebrate, then carry that wholeness into the next cycle.",
    },
    revLong: {
      zh: "逆位的世界说明事情还差最后一步：可能是一个项目迟迟收不了尾，一段经历还没有真正放下，或者你急于开始新的东西，跳过了总结和告别。把最后这一段走完，圆满才算真正到来。",
      en: "Reversed, the World says one last step remains: a project that won’t quite close, an experience not truly let go, or a rush into the new that skips reflection and goodbye. Walk the last stretch fully, and completion will truly arrive.",
    },
    lore: {
      zh: "世界是大阿卡纳的终点，也是愚者之旅的完成。画面中舞者手持两根短杖，环绕她的椭圆形花环象征圆满与永恒。四角的天使、鹰、狮子和公牛在命运之轮上也出现过，那时它们还在翻读书本，到了世界牌，书本已经放下，一切都已完成。黄金黎明体系将它对应土星。",
      en: "The World is the end of the Major Arcana and of the Fool’s Journey. The dancer holds two short wands inside an oval wreath of completion and eternity. The angel, eagle, lion and bull also appear on the Wheel of Fortune, where they are still reading their books; here the books are gone and the work is done. The Golden Dawn assigned Saturn.",
    },
  },
  "wands-01": {
    upLong: { zh: "一只手从云中伸出，握着一根正在发芽的权杖。权杖一代表一股新的热情或灵感：一个想做的项目、一份新工作、一段让你兴奋的经历。能量正处在最旺盛的起点，适合大胆开始。不需要计划得十全十美，先动起来，让热情带你走第一段路。", en: "A hand reaches from a cloud holding a budding wand. The Ace of Wands is a fresh surge of passion or inspiration: a project you want to start, a new job, an experience that excites you. Energy is strongest at the beginning, so start boldly. It doesn’t need a perfect plan; get moving and let the enthusiasm carry you through the first stretch." },
    revLong: { zh: "逆位时，火花有了，却点不着：可能是想法很多但迟迟没有行动，也可能是热情被延误、被打断，或者你对这件事其实没那么想做。问问自己，缺的是时机，还是真正的兴趣。如果是时机，先做一件很小的事；如果是兴趣，放下也无妨。", en: "Reversed, the spark is there but won’t catch: plenty of ideas and no action, enthusiasm delayed or interrupted, or a project you don’t actually want that much. Ask whether you lack timing or genuine interest. If it’s timing, do one very small thing; if it’s interest, it’s fine to let it go." },
    lore: { zh: "权杖对应火元素，代表行动、热情与创造力。在韦特牌之前，大多数塔罗的小阿卡纳数字牌只是把权杖或杯子排成图案，没有人物和场景。1909 年，画家帕梅拉·科尔曼·史密斯（Pamela Colman Smith）为 56 张小阿卡纳全部画上了有故事的场景，这是韦特牌后来广受欢迎、也容易上手的重要原因。黄金黎明体系称这张牌为「火之力量的根源」。", en: "Wands belong to Fire: action, passion and creativity. Before the Rider–Waite deck, most minor arcana pip cards simply arranged the suit symbols in a pattern, with no figures or scenes. In 1909 the artist Pamela Colman Smith gave all 56 minor cards scenes that tell a story, a big reason the deck became so popular and easy to learn. The Golden Dawn called this card the “Root of the Powers of Fire”." },
  },
  "wands-02": {
    upLong: { zh: "一个人站在城墙上，手捧地球仪望向远方，身边一根权杖固定在墙上。权杖二代表计划与选择：你已经有了一些基础，正在考虑下一步要走多远。这是做长远打算的好时机，想清楚自己真正想去的方向，然后为它做准备。", en: "A man stands on a battlement holding a globe and looking into the distance, one wand fixed to the wall beside him. The Two of Wands is planning and choosing: you have a foundation and are weighing how far to go next. It’s a good time for long-range thinking. Get clear on the direction you truly want, then prepare for it." },
    revLong: { zh: "逆位时，计划停在了纸上：可能是害怕未知，宁愿待在熟悉的地方；也可能是计划不够具体，所以迟迟迈不出去。把大目标拆成一个看得见的第一步，舒适区就没那么难离开了。", en: "Reversed, the plan stays on paper: fear of the unknown keeps you somewhere familiar, or the plan is too vague to act on. Break the big goal into one visible first step, and the comfort zone becomes easier to leave." },
    lore: { zh: "城墙上刻着红玫瑰与白百合交叉的图案，这组花在韦特牌里反复出现（魔术师的花园里也有），象征热情与纯洁的结合。手中的地球仪说明他的眼光已经越过了自己的城堡。黄金黎明体系称这张牌为「统治之主」。", en: "The wall bears a cross of red roses and white lilies, a pairing that recurs in the deck (it also fills the Magician’s garden): passion joined with purity. The globe in his hand shows his sights are already set beyond his own castle. The Golden Dawn called it the “Lord of Dominion”." },
  },
  "wands-03": {
    upLong: { zh: "一个人站在山崖上背对着我们，望着海面上驶来的船只，身边立着三根权杖。权杖三代表计划开始见到成效，视野也变得开阔。你已经付出了努力，现在可以看得更远：新的机会、合作或远方的可能性正在靠近。保持耐心，也为更大的舞台做准备。", en: "A figure stands on a cliff with his back to us, watching ships come in across the sea, three wands planted beside him. The Three of Wands is plans beginning to pay off and horizons widening. You’ve put in the effort; now look further out. New opportunities, partners or distant possibilities are approaching. Be patient, and prepare for a bigger stage." },
    revLong: { zh: "逆位时，船迟迟没有进港：进展比预期慢，或者遇到了意想不到的阻碍。也可能是眼光太局限，只盯着眼前，错过了更大的机会。先调整预期，检查计划里是哪一环出了问题，不要急着放弃。", en: "Reversed, the ships are slow to arrive: progress is slower than hoped, or unexpected obstacles appear. Your view may also be too narrow, fixed on what’s near and missing a bigger chance. Adjust your expectations and find which link in the plan failed before giving up." },
    lore: { zh: "船只在牌中通常象征贸易、远行和还在路上的收获。和权杖二相比，主角已经从城堡走到了更开阔的高处，计划也从设想进入了执行。黄金黎明体系称它为「确立的力量」。", en: "Ships usually stand for trade, travel and returns still on their way. Compared with the Two, the figure has left the castle for open high ground, and the plan has moved from idea to execution. The Golden Dawn called it “Established Strength”." },
  },
  "wands-04": {
    upLong: { zh: "四根权杖撑起一个挂满花环的拱门，人们举着花束欢迎，远处是城堡。权杖四代表庆祝、团聚和值得纪念的阶段：搬进新家、完成一个项目、一场婚礼或聚会。它提醒你停下来，和身边的人一起享受这份成果，感受归属与安稳。", en: "Four wands hold up a garlanded canopy, people raise bouquets in welcome, and a castle stands behind. The Four of Wands is celebration, reunion and a milestone worth marking: a new home, a finished project, a wedding or a gathering. Pause and enjoy what you’ve built with the people around you, and let yourself feel that you belong." },
    revLong: { zh: "逆位时，本该安稳的地方有了裂缝：家庭关系紧张、环境不稳定，或者身边缺少支持。也可能是庆祝被推迟，或者你明明有了成果，却没有真正的归属感。先找到一个能让你放松下来的人或地方。", en: "Reversed, a place meant to feel secure shows cracks: tension at home, an unstable environment, or little support around you. A celebration may be postponed, or you’ve achieved something yet don’t feel you belong. Start by finding one person or place where you can relax." },
    lore: { zh: "挂满花环的拱门在许多欧洲传统里与婚礼和丰收节庆有关，所以这张牌常被看作「喜事」与「回家」的象征。数字 4 在塔罗中通常代表稳定与结构，权杖四是其中最欢快的一张。黄金黎明体系称它为「完成的作品」。", en: "A garlanded canopy recalls weddings and harvest festivals in many European traditions, so this card is often read as happy news and homecoming. Fours in tarot usually mean stability and structure, and the Four of Wands is the most joyful of them. The Golden Dawn called it “Perfected Work”." },
  },
  "wands-05": {
    upLong: { zh: "五个年轻人各举着一根权杖，看起来在打斗，却没有人真正受伤。权杖五代表竞争、意见不合和小摩擦：团队里的争论、同行之间的比拼，或者生活中各种声音的拉扯。良性的竞争能让你更强，关键是把精力放在解决问题上，而不是赢过每一个人。", en: "Five young men each brandish a wand in what looks like a fight, though no one is actually hurt. The Five of Wands is competition, disagreement and friction: arguments in a team, rivalry with peers, many voices pulling at once. Healthy competition can make you stronger; put the energy into solving the problem, not into beating everyone." },
    revLong: { zh: "逆位时，紧张开始缓和，冲突可能正在平息。但也要留意另一种情况：你在回避一场其实需要面对的争论，把不满压在心里。有些话说开了，关系反而会更轻松。", en: "Reversed, tension is easing and the conflict may be settling. But watch for the other case: avoiding an argument that actually needs to happen and swallowing your frustration. Some things, once said, make a relationship lighter." },
    lore: { zh: "画中的人穿着不同的衣服，权杖挥向不同的方向，看起来更像一场游戏或训练，而不是真正的战斗，所以这张牌通常被解读为有惊无险的较量。黄金黎明体系称它为「争斗」。", en: "The figures wear different clothes and swing in every direction; it looks more like a game or practice than a real battle, so the card is usually read as a contest without real danger. The Golden Dawn called it “Strife”." },
  },
  "wands-06": {
    upLong: { zh: "一个骑着白马的人头戴月桂冠，权杖上也系着月桂花环，周围的人群在欢呼。权杖六代表胜利、成功与被看见。你的努力得到了认可，可能是升职、获奖、通过考试，或者在众人面前证明了自己。坦然接受这份肯定，它会给你继续前进的信心。", en: "A rider on a white horse wears a laurel crown, another wreath tied to his wand, as a crowd cheers. The Six of Wands is victory, success and being seen. Your effort is recognised: a promotion, an award, a passed exam, proving yourself in public. Accept the praise openly; it will give you confidence to keep going." },
    revLong: { zh: "逆位时，掌声没有如期而来：努力没有被看见，或者功劳被别人拿走了。也可能是你太在意别人的评价，让自我意识挡住了真正的进步。成果是你自己的，不必完全靠外界的认可来证明。", en: "Reversed, the applause doesn’t come: your effort goes unnoticed, or someone else takes the credit. Or caring too much about others’ opinions lets ego block real progress. The achievement is yours; it doesn’t need outside approval to be real." },
    lore: { zh: "月桂冠来自古希腊和古罗马，是授予胜利者和诗人的荣誉，这张牌画的就是一场凯旋归来的游行。黄金黎明体系称它为「胜利」。", en: "The laurel crown comes from ancient Greece and Rome, where it honoured victors and poets; the card shows a triumphant homecoming parade. The Golden Dawn called it “Victory”." },
  },
  "wands-07": {
    upLong: { zh: "一个人站在高处，手持一根权杖，抵挡着从下方伸上来的六根权杖。权杖七代表坚持立场、捍卫自己。你可能正面对质疑、竞争或压力，但你占据着有利的位置。相信自己的判断，守住重要的东西，不必因为反对的声音多就退让。", en: "A man on high ground holds one wand against six thrust up from below. The Seven of Wands is standing your ground and defending yourself. You may face doubt, competition or pressure, but you hold the better position. Trust your judgement and hold on to what matters; more opposing voices doesn’t mean you must give way." },
    revLong: { zh: "逆位时，你可能感到被压得喘不过气，开始怀疑值不值得坚持；也可能是防御过度，把所有人都当成了对手。分清哪些是真正需要捍卫的，哪些可以放手，会轻松很多。", en: "Reversed, you may feel overwhelmed and wonder whether holding on is worth it, or you’ve become so defensive that everyone looks like an opponent. Sorting what truly needs defending from what can be let go will lighten things a lot." },
    lore: { zh: "仔细看会发现，画中人两只脚穿着不同的鞋，一只是靴子，一只是便鞋，常被解读为他在毫无准备的情况下仓促应战，却依然守住了阵地。黄金黎明体系称这张牌为「勇气」。", en: "Look closely and the man wears mismatched footwear, a boot on one foot and a shoe on the other, often read as being caught unprepared yet still holding the line. The Golden Dawn called this card “Valour”." },
  },
  "wands-08": {
    upLong: { zh: "八根权杖整齐地划过天空，画面里没有人，只有飞行的速度感。权杖八代表快速的进展、消息和行动。事情可能突然加速：回复来了、计划推进了、行程定下来了。顺着这股势头往前走，趁热把该做的事做完。", en: "Eight wands fly in formation across the sky; there are no people, only a sense of speed. The Eight of Wands is swift progress, news and action. Things may suddenly accelerate: replies arrive, plans move, travel is settled. Ride the momentum and get things done while it lasts." },
    revLong: { zh: "逆位时，速度出了问题：可能是延误、消息迟迟不来，也可能是太急了，仓促之间出错。如果事情卡住了，先找到卡在哪里；如果事情太快，就有意识地放慢一点。", en: "Reversed, the pace is off: delays and news that won’t come, or so much haste that mistakes slip in. If things are stuck, find the blockage; if they’re moving too fast, slow down on purpose." },
    lore: { zh: "这是韦特牌中少数没有人物的牌之一，画面只有权杖和风景，强调的是事情本身在动。传统上它也常被联系到远行、航班和来自远方的消息。黄金黎明体系称它为「迅捷」。", en: "This is one of the few Rider–Waite cards with no figures at all, only wands and landscape: the matter itself is in motion. Traditionally it is also linked to travel, flights and news from afar. The Golden Dawn called it “Swiftness”." },
  },
  "wands-09": {
    upLong: { zh: "一个头上缠着绷带的人倚着权杖，警惕地望着前方，身后的八根权杖像一排篱笆。权杖九代表韧性与坚持。你已经走了很远，也受了些伤，但离终点不远了。保持警觉，守住最后一段，你比自己以为的更能撑。", en: "A man with a bandaged head leans on his wand and watches warily, eight more wands behind him like a fence. The Nine of Wands is resilience and persistence. You’ve come a long way and taken some knocks, but the end is close. Stay alert and hold the last stretch; you can endure more than you think." },
    revLong: { zh: "逆位时，疲惫压过了韧性：你可能已经撑到极限，或者因为过去的伤害变得处处设防，不再相信别人。这时候需要的不是继续咬牙，而是休息，以及让别人帮你一把。", en: "Reversed, exhaustion outweighs resilience: you may be at your limit, or past hurts have made you guarded and distrustful. What you need now isn’t more gritted teeth but rest, and letting someone help." },
    lore: { zh: "头上的绷带说明他已经经历过战斗，身后的权杖既是他的防线，也是他走过的路，这张牌因此常被称为「最后的防线」。黄金黎明体系称它为「强大的力量」。", en: "The bandage shows he has already fought; the wands behind him are both his defence and the road he has travelled, so the card is often called “the last line of defence”. The Golden Dawn called it “Great Strength”." },
  },
  "wands-10": {
    upLong: { zh: "一个人弯着腰，抱着十根沉重的权杖走向远处的城镇，几乎看不见前面的路。权杖十代表负担过重：责任、工作和承诺一件件叠上来，全由你一个人扛着。终点也许不远，但要问问自己：这些真的都必须由你来背吗？", en: "Bent over, a man carries ten heavy wands toward a distant town, barely able to see ahead. The Ten of Wands is overload: responsibilities, work and promises stacked one on another, all carried alone. The destination may be close, but ask whether all of this really has to be yours to carry." },
    revLong: { zh: "逆位时，你开始放下重担：学会分配任务、拒绝不属于你的事，或者承认自己撑不住了，这是好的转变。也可能是压力已经到了临界点，那就更需要马上卸下一部分。", en: "Reversed, you begin putting the load down: delegating, refusing what isn’t yours, or admitting you can’t carry it all. That’s a good shift. It can also mean the pressure has reached breaking point, which makes setting some of it down urgent." },
    lore: { zh: "权杖十是权杖牌组的最后一张数字牌，权杖一里那团新鲜的火焰，到这里变成了沉重的责任，常被看作「成功的代价」。黄金黎明体系称它为「压迫」。", en: "The last numbered card of the suit, the Ten turns the fresh flame of the Ace into a heavy burden, often read as the cost of success. The Golden Dawn called it “Oppression”." },
  },
  "wands-page": {
    upLong: { zh: "一个年轻人站在荒漠中，好奇地看着手中的权杖，衣服上绣着火蜥蜴的图案。权杖侍从代表好奇心、热情和探索的开始：一个新的兴趣、一条好消息，或者一个想要尝试的念头。像学徒一样去学、去试，不用担心自己还不够熟练。", en: "A young man stands in a desert looking curiously at his wand, salamanders patterned on his tunic. The Page of Wands is curiosity, enthusiasm and the start of exploring: a new interest, good news, or an idea you want to try. Learn and experiment like an apprentice, and don’t worry about not being skilled yet." },
    revLong: { zh: "逆位时，热情来得快去得也快：三分钟热度，开了很多头却没有坚持；或者想法很多却不敢行动。也可能是一些消息被耽搁了。挑一件最想做的事，坚持下去比开始更重要。", en: "Reversed, enthusiasm comes and goes quickly: short-lived passions, many starts and no follow-through, or plenty of ideas without the nerve to act. News may also be delayed. Pick the one thing you most want to do; sticking with it matters more than starting." },
    lore: { zh: "火蜥蜴在欧洲传说中被认为能在火焰里生存，因此成为火元素的象征，它出现在权杖宫廷牌的服饰和王座上。侍从通常代表学生、年轻人或消息；在早期纸牌中，他们本来就是替贵族传递讯息的随从。", en: "In European legend the salamander could live in fire, so it became the emblem of the Fire element; it decorates the clothing and thrones of the Wands court. Pages usually stand for students, young people or messages; in early card decks they were the attendants who carried news for the nobility." },
  },
  "wands-knight": {
    upLong: { zh: "骑士骑着一匹扬起前蹄的马，身穿绣着火蜥蜴的外衣，正要向前冲去。权杖骑士代表大胆的行动、冒险和充沛的精力。这是说走就走、敢想敢做的时候：去旅行、去追求、去挑战。热情是你最大的优势，只要别忘了先看一眼路线。", en: "The knight rides a rearing horse in a tunic covered in salamanders, about to charge forward. The Knight of Wands is bold action, adventure and abundant energy. It’s a time to go, to chase and to take on challenges. Passion is your greatest strength; just glance at the route first." },
    revLong: { zh: "逆位时，冲劲变成了冲动：做事急躁、半途而废，或者没想清楚就贸然行动，结果四处碰壁。也可能是精力突然耗尽，提不起劲。先慢下来确认方向，再重新出发。", en: "Reversed, drive turns into impulsiveness: rushing, quitting halfway, or charging in without thinking and hitting walls. Energy may also suddenly run out. Slow down, check your direction, then set off again." },
    lore: { zh: "韦特牌中四位骑士的马姿态各不相同，代表四种元素的行动方式。权杖骑士的马前蹄高高扬起，他是四位骑士中最急切、最冲动的一位。远处金字塔形状的山丘也呼应着炎热的火之大地。", en: "In the Rider–Waite deck each knight’s horse moves differently, showing how each element acts. The Knight of Wands’ horse rears high: he is the most eager and impulsive of the four. The pyramid-shaped hills behind him echo a hot, fiery land." },
  },
  "wands-queen": {
    upLong: { zh: "权杖皇后坐在王座上，一手持权杖，一手握着向日葵，脚边坐着一只黑猫。她代表自信、温暖和感染力：清楚自己是谁，也乐于照亮身边的人。这张牌鼓励你大方地展现自己，用热情和行动带动周围的人，同时保持独立和主见。", en: "The Queen of Wands sits on her throne holding a wand in one hand and a sunflower in the other, a black cat at her feet. She is confidence, warmth and magnetism: she knows who she is and enjoys lighting up those around her. Show yourself generously, lead with energy and action, and keep your independence and your own mind." },
    revLong: { zh: "逆位时，她的光芒暗了下来：可能是不安或嫉妒占了上风，开始和别人比较；也可能是过度操劳，把自己烧干了。先把注意力收回到自己身上，找回那件让你发光的事。", en: "Reversed, her light dims: insecurity or jealousy takes over and comparison creeps in, or overwork burns you out. Bring the focus back to yourself and find again the thing that makes you shine." },
    lore: { zh: "向日葵象征生命力和对太阳的追随；脚边的黑猫在传统上与直觉和神秘有关，也说明她并不回避自己不那么明亮的一面。王座两侧的狮子则呼应火象星座狮子座。", en: "The sunflower stands for vitality and devotion to the sun. The black cat at her feet is traditionally linked to intuition and mystery, a sign that she doesn’t shy away from her less sunny side. The lions on her throne echo Leo, a fire sign." },
  },
  "wands-king": {
    upLong: { zh: "国王坐在雕着狮子和火蜥蜴的王座上，手持权杖望向远方，脚边还有一只小火蜥蜴。权杖国王代表远见、领导力和魄力。他知道自己要去哪里，也能带着别人一起去。这张牌鼓励你承担起领导的角色，用愿景带动他人，并把想法真正落地。", en: "The king sits on a throne carved with lions and salamanders, wand in hand, gazing into the distance, a small salamander at his feet. The King of Wands is vision, leadership and boldness. He knows where he’s going and can bring others with him. Step into a leading role, inspire others with your vision, and turn ideas into reality." },
    revLong: { zh: "逆位时，魄力变成了专断：急躁、听不进意见，或者对别人要求过高。也可能是空有远大的想法，却没有落地。好的领导既要看得远，也要听得进去。", en: "Reversed, boldness turns domineering: impatient, deaf to advice, demanding too much of others. Or grand ideas never touch the ground. Good leadership means seeing far and also listening." },
    lore: { zh: "王座上的火蜥蜴咬着自己的尾巴，围成圆环，和魔术师腰间的衔尾蛇一样，象征不会熄灭的能量与循环。在宫廷牌中，国王代表一个元素最成熟、最稳定的状态。", en: "The salamanders on his throne bite their own tails to form rings, like the snake around the Magician’s waist: energy that never burns out. Among the court cards, kings show the most mature and settled expression of their element." },
  },
  "cups-01": {
    upLong: { zh: "一只手从云中伸出，托着一只满溢的圣杯，五道水流从杯中涌出，一只白鸽衔着圣饼飞向杯口。圣杯一代表情感上的新开始：一段新的关系、一份重新涌起的爱意，或者内心终于被打开。让感受自然流动，不必急着定义它，先允许自己去爱和被爱。", en: "A hand reaches from a cloud holding an overflowing cup; five streams pour from it, and a white dove descends carrying a wafer. The Ace of Cups is an emotional new beginning: a new relationship, love welling up again, or a heart finally opening. Let the feeling flow without rushing to define it, and allow yourself to love and be loved." },
    revLong: { zh: "逆位时，杯子里的水流不出来：可能是情绪被压抑，不愿意表达；也可能是感情受挫后把心关上了，或者你一直在为别人付出，却没有留给自己。先承认自己真实的感受，哪怕只是写下来，也是让它重新流动的开始。", en: "Reversed, the water can’t flow: feelings held back and unspoken, a heart closed after being hurt, or so much given to others that nothing is left for you. Start by admitting what you really feel; even writing it down is a way to let it move again." },
    lore: { zh: "圣杯对应水元素，代表情感、关系与直觉。圣杯一的画面带有明显的宗教意象：白鸽是圣灵的象征，圣饼上刻着十字，杯中的五道水流常被联系到五种感官，水面下还漂着睡莲。也有人把这只杯子与亚瑟王传说中的圣杯联系起来。黄金黎明体系称它为「水之力量的根源」。", en: "Cups belong to Water: emotion, relationships and intuition. The Ace carries clear religious imagery: the dove is the Holy Spirit, the wafer bears a cross, the five streams are often linked to the five senses, and water lilies float below. Some also connect the cup with the Holy Grail of Arthurian legend. The Golden Dawn called it the “Root of the Powers of Water”." },
  },
  "cups-02": {
    upLong: { zh: "一男一女相对而立，互相交换手中的杯子，上方飘着一个长着翅膀的狮头和缠绕的双蛇杖。圣杯二代表两个人之间的相互吸引与平等的连结：可能是爱情，也可能是友情、合作或和解。它的重点是「互相」，双方都在付出，也都在接受。", en: "A man and a woman face each other and exchange cups, while a winged lion’s head and a staff entwined with two snakes float above them. The Two of Cups is mutual attraction and an equal bond between two people: love, but also friendship, partnership or reconciliation. The key word is mutual; both give and both receive." },
    revLong: { zh: "逆位时，两人之间的平衡被打破了：沟通出了问题、彼此的期待不一致，或者一方付出得多，另一方回应得少。也可能是一段关系正在疏远。坦诚地聊一聊，比各自猜测对方的想法更能修复关系。", en: "Reversed, the balance between two people breaks: communication falters, expectations don’t match, or one side gives far more than the other. A relationship may be drifting apart. An honest conversation will repair more than each of you guessing what the other thinks." },
    lore: { zh: "两人头顶的双蛇杖（caduceus）来自希腊神话中信使赫尔墨斯的权杖，象征沟通与调和；狮头和翅膀则被解读为激情与精神的结合。这张牌也常被看作小阿卡纳里的「恋人牌」。黄金黎明体系称它为「爱」。", en: "The staff with two snakes above them is the caduceus of Hermes, messenger of the Greek gods, a symbol of communication and reconciliation; the winged lion’s head is read as passion joined with spirit. The card is often called the Lovers of the minor arcana. The Golden Dawn called it “Love”." },
  },
  "cups-03": {
    upLong: { zh: "三位女子在丰收的果实间举杯起舞。圣杯三代表友谊、庆祝和群体的快乐：朋友聚会、一起完成某件事后的庆功，或者身边有一群真心相待的人。好好享受这份热闹和支持，也记得把快乐分享出去。", en: "Three women raise their cups and dance among the fruits of the harvest. The Three of Cups is friendship, celebration and shared joy: a gathering of friends, a celebration after achieving something together, or a circle of people who truly care for you. Enjoy the warmth and support, and pass the joy along." },
    revLong: { zh: "逆位时，欢聚出了些问题：可能是聚会过度、吃喝玩乐失了分寸；也可能是朋友之间有了摩擦、小圈子里的是非，或者你在热闹中反而感到孤单。留意哪些关系真正滋养你，哪些只是在消耗你。", en: "Reversed, the celebration goes a little wrong: too much partying and indulgence, friction or gossip within a group of friends, or feeling lonely in the middle of a crowd. Notice which relationships truly nourish you and which only drain you." },
    lore: { zh: "画面中的三位女子常被联系到希腊神话中的美惠三女神，她们象征美、喜悦与丰盛。脚下的南瓜、葡萄和果实说明这是一场丰收后的庆祝。黄金黎明体系称它为「丰盛」。", en: "The three women are often linked to the Three Graces of Greek myth, figures of beauty, joy and abundance. The gourds, grapes and fruit at their feet show this is a harvest celebration. The Golden Dawn called it “Abundance”." },
  },
  "cups-04": {
    upLong: { zh: "一个年轻人双臂交叉坐在树下，盯着面前的三只杯子，没有注意到云中伸出的一只手正递来第四只杯子。圣杯四代表倦怠、不满足和对眼前事物的冷淡。你可能觉得一切都没意思，或者沉浸在自己的情绪里，错过了身边新的机会。抬起头看看，也许有东西正在等你接住。", en: "A young man sits under a tree with his arms crossed, staring at three cups in front of him, not noticing a hand from a cloud offering a fourth. The Four of Cups is boredom, dissatisfaction and indifference to what’s in front of you. Everything may feel flat, or you may be so absorbed in your own mood that you miss a new opportunity. Look up; something may be waiting for you to take it." },
    revLong: { zh: "逆位时，你开始从倦怠中走出来：重新对事情产生兴趣，愿意接受新的机会和邀请。也可能是你终于意识到自己一直在逃避什么。顺着这份重新出现的好奇心，迈出一小步。", en: "Reversed, you begin to climb out of apathy: interest returns and you’re open to new chances and invitations. You may also finally see what you’ve been avoiding. Follow that returning curiosity and take one small step." },
    lore: { zh: "这张牌的构图和佛陀在菩提树下静坐有几分相似，有人因此把它解读为向内沉思；但更常见的解读是情绪上的封闭和对机会视而不见。云中伸出的手与四张王牌（一号牌）里的手相同，代表来自外界的礼物。黄金黎明体系称它为「混杂的欢愉」。", en: "The pose under the tree has been compared to the Buddha meditating, so some read the card as inward contemplation, though it is more often read as emotional withdrawal and ignoring opportunity. The hand from the cloud is the same hand that appears on the four Aces, a gift from outside. The Golden Dawn called it “Blended Pleasure”." },
  },
  "cups-05": {
    upLong: { zh: "一个披着黑斗篷的人低头看着三只倒下的杯子，身后还有两只杯子立着，远处一座桥通向一栋房子。圣杯五代表失落、遗憾和悲伤。失去的东西是真实的，难过也是应该的。但当你准备好的时候，记得转身看看：还有两只杯子没有倒下，桥也还在。", en: "A figure in a black cloak looks down at three spilled cups, while two still stand behind him and a bridge in the distance leads to a house. The Five of Cups is loss, regret and grief. What was lost is real, and it’s right to feel sad. When you’re ready, remember to turn around: two cups are still standing, and the bridge is still there." },
    revLong: { zh: "逆位时，你开始从失落中走出来：接受已经发生的事，原谅自己或别人，重新看见身边还拥有的东西。也可能是一直压着没处理的悲伤需要被面对。给自己时间，慢慢来就好。", en: "Reversed, you’re beginning to move through the loss: accepting what happened, forgiving yourself or someone else, and seeing again what you still have. It may also mean a grief you’ve pushed down needs attention. Give yourself time; slowly is fine." },
    lore: { zh: "黑色斗篷是哀悼的颜色，人物专注于倒下的三只杯子，完全没有注意身后的两只，这正是这张牌最核心的画面：沉浸在失去里，看不到留下的。远处的桥常被解读为通往复原的路。黄金黎明体系称它为「欢愉中的失落」。", en: "Black is the colour of mourning, and the figure is so focused on the three fallen cups that he doesn’t see the two behind him; that is the heart of the card, absorbed in what’s lost and blind to what remains. The distant bridge is often read as the way back to recovery. The Golden Dawn called it “Loss in Pleasure”." },
  },
  "cups-06": {
    upLong: { zh: "一个小男孩把一只插满白花的杯子递给小女孩，背景是一座古老的村庄。圣杯六代表回忆、童年、纯真和温暖的旧日情谊：可能是想起过去，遇见老朋友，回到故乡，或者一份不求回报的善意。让这些美好的记忆滋养你，也用同样的单纯去对待别人。", en: "A small boy hands a girl a cup filled with white flowers, an old village behind them. The Six of Cups is memory, childhood, innocence and warm old bonds: thinking of the past, meeting an old friend, going home, or a kindness that asks nothing back. Let good memories nourish you, and treat others with the same simplicity." },
    revLong: { zh: "逆位时，你可能太沉浸在过去：总觉得以前更好，不愿面对现在的变化；或者被童年的某些经历困住了。回忆可以是力量，但不该成为留在原地的理由。看看现在的你，已经长成了什么样子。", en: "Reversed, you may be living too much in the past: sure things were better before, unwilling to face present changes, or stuck in something from childhood. Memory can be a strength, but not a reason to stay where you were. Look at who you’ve grown into now." },
    lore: { zh: "这张牌的场景带着一种童话般的怀旧感，杯中的白花常被认为是象征纯洁的星形花。画面左边还有一个守卫转身离开，有人把这解读为「大人的世界」正在远去，留下孩子们的天真。黄金黎明体系称它为「欢愉」。", en: "The scene has a fairy-tale nostalgia; the white flowers in the cups are star-shaped blossoms read as purity. On the left a guard walks away, which some read as the adult world receding and leaving the children their innocence. The Golden Dawn called it “Pleasure”." },
  },
  "cups-07": {
    upLong: { zh: "一个人面对着悬在云中的七只杯子，杯里装着各种幻象：城堡、珠宝、月桂冠、一条蛇、一条龙、一个人头，还有一个蒙着布的发光身影。圣杯七代表选择太多、幻想和白日梦。每个选项都闪闪发亮，但不是每一个都是真的。分清哪些是愿望，哪些是能实际做到的，再做决定。", en: "A figure faces seven cups floating in the clouds, each holding a vision: a castle, jewels, a laurel wreath, a snake, a dragon, a head, and a glowing veiled figure. The Seven of Cups is too many choices, fantasy and daydreaming. Every option glitters, but not all of them are real. Separate wishes from what you can actually do before you decide." },
    revLong: { zh: "逆位时，迷雾开始散去：你逐渐看清哪些选项是空想，开始收拢注意力，准备做出实际的选择。也可能是你在逃避选择，宁愿一直停在想象里。挑一个最实际的方向，先行动起来。", en: "Reversed, the haze begins to clear: you start to see which options are fantasy, gather your focus and get ready to choose. Or you may be avoiding the choice and staying in your imagination. Pick the most realistic direction and start acting on it." },
    lore: { zh: "七只杯子里的东西常被逐一解读：城堡是安稳，珠宝是财富，月桂冠是成功（但杯子上隐约有骷髅的图样），蛇是诱惑或智慧，龙是恐惧，人头是爱慕的对象，蒙布的身影是未知的自我。画面里看不到人物的表情，因为他只是一个背影。黄金黎明体系称它为「虚幻的成功」。", en: "The contents of the cups are often read one by one: the castle as security, jewels as wealth, the laurel wreath as success (though its cup bears a faint skull), the snake as temptation or wisdom, the dragon as fear, the head as someone admired, and the veiled figure as the unknown self. We never see the dreamer’s face; he is only a silhouette. The Golden Dawn called it “Illusionary Success”." },
  },
  "cups-08": {
    upLong: { zh: "一个人在夜里拄着手杖，背对着整齐叠放的八只杯子，走向远处的群山，天上的月亮半明半暗。圣杯八代表离开：放下一段已经不再满足你的关系、工作或生活方式，去寻找更深层的意义。离开并不意味着失败，而是你清楚知道，自己想要的东西不在这里。", en: "At night, a figure with a walking staff turns his back on eight neatly stacked cups and heads toward distant mountains under a half-shadowed moon. The Eight of Cups is walking away: leaving a relationship, job or way of life that no longer fulfils you, to look for something deeper. Leaving isn’t failure; you simply know that what you want isn’t here." },
    revLong: { zh: "逆位时，你可能知道该离开，却一直犹豫：害怕失去已经拥有的，或者担心外面的世界更糟。也可能是在反复离开又回来。问问自己，留下是因为想留，还是因为不敢走。", en: "Reversed, you may know it’s time to go yet keep hesitating, afraid to lose what you have or that things outside are worse. You may also keep leaving and coming back. Ask whether you’re staying because you want to, or because you’re afraid to go." },
    lore: { zh: "八只杯子叠得很整齐，但中间缺了一个空位，常被解读为生活看似完整，却总少了点什么。天上的月亮被画成新月与满月叠在一起的样子，带着一张侧脸，暗示时间的流逝和内心的转变。黄金黎明体系称它为「被放弃的成功」。", en: "The eight cups are neatly stacked but leave a gap, often read as a life that looks complete yet is missing something. The moon is drawn as a crescent laid over a full moon, with a face in profile, suggesting the passing of time and an inner shift. The Golden Dawn called it “Abandoned Success”." },
  },
  "cups-09": {
    upLong: { zh: "一个人双臂交叉，满足地坐在长凳上，身后的弧形桌面上整齐地摆着九只杯子。圣杯九常被称为「愿望牌」，代表满足、享受和愿望成真。你想要的东西可能正在实现，或者你已经拥有了让自己感到满足的生活。允许自己享受它，不必觉得愧疚。", en: "A man sits contentedly on a bench with his arms crossed, nine cups lined up on a curved table behind him. Often called the “wish card”, the Nine of Cups is satisfaction, enjoyment and wishes coming true. What you want may be on its way, or you may already have a life that satisfies you. Let yourself enjoy it without guilt." },
    revLong: { zh: "逆位时，满足感出了问题：明明拥有了很多，却还是不开心；或者过度追求享乐，用物质填补内心的空缺。也可能是愿望迟迟没有实现。停下来想想，你真正想要的是什么，而不是别人觉得你应该想要什么。", en: "Reversed, satisfaction goes awry: you have plenty and still aren’t happy, or you chase pleasure and use things to fill an inner gap. A wish may also be slow to come true. Pause and think about what you really want, not what others think you should want." },
    lore: { zh: "画中人物衣着华丽、神情得意，身后的蓝色桌布像是为宴会准备的。早期的解读认为他代表物质上的满足，后来「愿望牌」的说法流传开来，抽到这张牌也常被当作好兆头。黄金黎明体系称它为「物质的幸福」。", en: "The figure is richly dressed and looks pleased with himself, the blue cloth behind him laid as if for a feast. Early readings saw him as material contentment; later the “wish card” label spread, and drawing it became a popular good omen. The Golden Dawn called it “Material Happiness”." },
  },
  "cups-10": {
    upLong: { zh: "一对夫妇搂着彼此，张开手臂迎向天上由十只杯子组成的彩虹，两个孩子在旁边跳舞，远处是一座小房子。圣杯十代表家庭的幸福、情感上的圆满与归属：和所爱的人在一起，彼此支持，内心平静。这是圣杯牌组里最温暖的一张，好好珍惜身边的人。", en: "A couple embrace and raise their arms to a rainbow of ten cups, two children dance beside them, and a small house stands in the distance. The Ten of Cups is family happiness, emotional fulfilment and belonging: being with the people you love, supporting each other, at peace inside. It is the warmest card in the suit; cherish the people around you." },
    revLong: { zh: "逆位时，家庭或亲密关系出现了不和谐：价值观不同、沟通不畅，或者理想中的幸福和现实有落差。也可能是你太执着于完美家庭的样子。幸福不一定要符合想象，真诚的连结比完美的画面更重要。", en: "Reversed, there’s discord in family or close relationships: different values, poor communication, or a gap between the happiness you imagined and reality. You may also be too attached to a picture of the perfect family. Happiness doesn’t have to match the image; a sincere connection matters more than a perfect scene." },
    lore: { zh: "彩虹在西方传统中是希望与承诺的象征，在《圣经》里是神与人立约的记号。这张牌作为圣杯牌组的终点，与圣杯一那只满溢的杯子遥相呼应：最初的一份爱意，最后变成了一个家。黄金黎明体系称它为「圆满的成功」。", en: "In Western tradition the rainbow is a sign of hope and promise; in the Bible it marks God’s covenant. As the end of the suit, the card answers the overflowing cup of the Ace: a single stirring of love has become a home. The Golden Dawn called it “Perfected Success”." },
  },
  "cups-page": {
    upLong: { zh: "一个年轻人站在海边，手中的杯子里探出一条小鱼，他好奇地看着它。圣杯侍从代表直觉的萌芽、情感上的惊喜和创造力：一个突如其来的灵感、一段温柔的心意，或者一条好消息。保持开放和好奇，别急着用理性否定那些看起来有点天真的想法。", en: "A young man stands by the sea, looking curiously at a small fish peeking out of his cup. The Page of Cups is budding intuition, emotional surprises and creativity: a sudden inspiration, a tender feeling, or good news. Stay open and curious, and don’t rush to reason away ideas that seem a little naive." },
    revLong: { zh: "逆位时，情绪变得不太稳定：可能是太敏感、容易受伤，或者沉浸在幻想里不愿面对现实。也可能是创意被压抑了。照顾好自己的情绪，同时找一个合适的方式把它表达出来。", en: "Reversed, emotions get unsteady: being too sensitive and easily hurt, or lost in fantasy and avoiding reality. Creativity may also be blocked. Look after your feelings, and find a good outlet to express them." },
    lore: { zh: "杯中跳出的鱼是这张牌最有趣的细节：鱼生活在水中，象征从潜意识里浮现出来的想法和感受。侍从衣服上印着莲花图案，身后的海浪也呼应水元素。在宫廷牌中，侍从常代表学生、孩子或一条消息。", en: "The fish leaping from the cup is the card’s most playful detail: a creature of the water, it stands for thoughts and feelings rising from the unconscious. Lotus flowers pattern his tunic, and the waves behind echo the Water element. Among the court cards, pages often represent students, children or a message." },
  },
  "cups-knight": {
    upLong: { zh: "骑士骑着一匹缓步前行的白马，双手平稳地捧着一只杯子，像是要把它送到某人面前。圣杯骑士代表浪漫、真诚的邀请和跟随内心的行动：可能是一次表白、一个提议，或者一段充满感情的旅程。他不急不躁，用心意打动别人。", en: "The knight rides a white horse at a slow walk, holding a cup steadily before him as if bringing it to someone. The Knight of Cups is romance, sincere invitations and acting from the heart: a confession of love, an offer, or a journey full of feeling. He is unhurried, and wins people over with sincerity." },
    revLong: { zh: "逆位时，浪漫变得不太可靠：情绪化、承诺太轻易，或者只说不做。也可能是你把一个人或一件事理想化了，忽略了现实。在投入感情之前，先看看行动是不是跟得上话语。", en: "Reversed, romance becomes unreliable: moodiness, promises made too easily, or all talk and no action. You may also be idealising someone or something and ignoring reality. Before you invest your feelings, check whether actions match the words." },
    lore: { zh: "圣杯骑士的头盔和脚跟上都有翅膀，这是信使赫尔墨斯的标志，说明他是一位带来讯息的使者。和权杖骑士那匹扬蹄冲锋的马相比，他的马走得很慢，体现了水元素温和、感性的一面。", en: "The Knight of Cups has wings on his helmet and heels, the mark of Hermes the messenger, so he is an envoy bringing word. Compared with the Knight of Wands’ rearing charger, his horse moves slowly, showing the gentle, feeling side of Water." },
  },
  "cups-queen": {
    upLong: { zh: "圣杯皇后坐在海边的王座上，凝视着手中一只华丽的杯子，脚下的水轻轻漫上岸。她代表同理心、温柔和敏锐的直觉：能感受到别人没说出口的情绪，也懂得照顾自己的内心。这张牌鼓励你信任自己的感受，用温柔而稳定的方式支持身边的人。", en: "The Queen of Cups sits on a throne at the water’s edge, gazing at an ornate cup, the sea lapping at her feet. She is empathy, tenderness and keen intuition: she senses feelings others leave unspoken and knows how to care for her own heart. Trust your feelings, and support the people around you with steady gentleness." },
    revLong: { zh: "逆位时，同理心变成了负担：太在意别人的情绪，以至于迷失了自己；或者情绪起伏很大，难以平静。也可能是你一直在照顾别人，却忽视了自己的需要。在帮助别人之前，先确认自己的杯子里还有水。", en: "Reversed, empathy becomes a burden: so attuned to others’ feelings that you lose yourself, or emotions swinging hard. You may be caring for everyone and ignoring your own needs. Before you help others, make sure your own cup still holds water." },
    lore: { zh: "她手中的杯子带着天使形状的把手，而且是整个圣杯牌组中唯一一只有盖子的杯子，常被解读为她的内心世界深邃而私密，不轻易向外展示。王座上雕刻着水中精灵和贝壳，她的脚就踩在水与陆地的交界处。", en: "Her cup has angel-shaped handles and is the only covered cup in the whole suit, often read as an inner world that is deep and private, not easily shown. Her throne is carved with water sprites and shells, and her feet rest right where water meets land." },
  },
  "cups-king": {
    upLong: { zh: "圣杯国王坐在一块漂浮在海上的石座上，四周波浪起伏，他却神情平静，一手持杯，一手握着权杖。他代表情绪上的成熟与稳定：能感受强烈的情绪，却不被它们左右。这张牌鼓励你在动荡中保持冷静，用理解和包容处理人际关系。", en: "The King of Cups sits on a stone throne floating on a rough sea, calm despite the waves, a cup in one hand and a sceptre in the other. He is emotional maturity and balance: he feels deeply without being ruled by it. Stay calm in turbulence, and handle relationships with understanding and tolerance." },
    revLong: { zh: "逆位时，平静只是表面：情绪被压抑，突然爆发；或者用冷漠掩饰内心的波动，甚至用情绪去操控别人。真正的稳定不是压住感受，而是承认它，然后选择如何回应。", en: "Reversed, the calm is only on the surface: feelings suppressed until they burst out, coldness hiding inner turmoil, or even using emotions to control others. Real stability isn’t holding feelings down; it’s acknowledging them and then choosing how to respond." },
    lore: { zh: "国王身后，一边是一艘航行的船，一边是一条跃出水面的鱼，象征他既能驾驭现实世界，也能潜入情感的深海。他胸前挂着一条鱼形的项链。在四位国王中，他是唯一被水包围的一位。", en: "Behind the king a ship sails on one side and a fish leaps from the waves on the other: he can navigate the practical world and dive into the deep sea of feeling. He wears a fish-shaped pendant on his chest. Of the four kings, he is the only one surrounded by water." },
  },
  "swords-01": {
    upLong: { zh: "一只手从云中伸出，握着一把直立的宝剑，剑尖戴着一顶王冠，两侧挂着橄榄枝和棕榈枝。宝剑一代表清晰的思路、真相和突破：一个想通了的瞬间、一个果断的决定，或者终于说出口的真话。用理性切开混乱，看清事情本来的样子。", en: "A hand reaches from a cloud gripping an upright sword crowned at its tip, with olive and palm branches hanging on either side. The Ace of Swords is clarity, truth and breakthrough: a moment when it all makes sense, a decisive choice, or a truth finally spoken. Use reason to cut through confusion and see things as they are." },
    revLong: { zh: "逆位时，思路被搅乱了：信息太多、判断失误，或者被误解、沟通不清。也可能是用言语伤了人，或者被别人的话伤到。先停下来理清事实，再开口或做决定。", en: "Reversed, your thinking gets muddled: too much information, a poor judgement, or being misunderstood. Words may also be used as weapons, by you or against you. Stop and sort out the facts before you speak or decide." },
    lore: { zh: "宝剑对应风元素，代表思想、语言、真相与冲突。剑是双刃的，既能斩断迷雾，也能伤人，所以宝剑牌组整体看起来比较严峻。王冠象征思想的胜利，橄榄枝代表和平，棕榈枝代表胜利。黄金黎明体系称这张牌为「风之力量的根源」。", en: "Swords belong to Air: thought, words, truth and conflict. A sword is double-edged, able to cut through fog or to wound, which is why the suit as a whole looks rather stern. The crown stands for the triumph of the mind, the olive branch for peace and the palm for victory. The Golden Dawn called this card the “Root of the Powers of Air”." },
  },
  "swords-02": {
    upLong: { zh: "一位蒙着眼睛的女子坐在海边，双手交叉握着两把宝剑，身后是礁石和一弯新月。宝剑二代表僵局和难以做出的决定。你可能在两个选择之间犹豫，或者刻意不去看某些事实，好让自己保持平静。暂时的平衡可以理解，但迟早要摘下眼罩，看清楚再选。", en: "A blindfolded woman sits by the sea holding two swords crossed over her chest, rocks and a crescent moon behind her. The Two of Swords is stalemate and a hard decision. You may be torn between two options, or deliberately not looking at certain facts to stay calm. A temporary balance is understandable, but sooner or later the blindfold has to come off so you can see and choose." },
    revLong: { zh: "逆位时，僵局开始松动：要么是你终于愿意面对真相，做出选择；要么是信息太多、压力太大，让你更加不知所措。如果感到混乱，可以找一个信任的人帮你一起梳理。", en: "Reversed, the stalemate loosens: either you’re finally ready to face the truth and choose, or too much information and pressure leaves you even more lost. If it feels chaotic, ask someone you trust to help you sort it out." },
    lore: { zh: "蒙眼的女子背对着大海，看不见身后的波浪和礁石，象征她隔绝了外界的情绪和干扰。交叉的双剑在胸前形成一个屏障，保护着她的心。黄金黎明体系称这张牌为「恢复的和平」，强调这是一种暂时的、需要维持的平静。", en: "With her back to the sea, the blindfolded woman can’t see the waves or the rocks: she has shut out emotion and distraction. The swords crossed over her chest form a barrier guarding her heart. The Golden Dawn called this card “Peace Restored”, stressing that the calm is temporary and has to be held." },
  },
  "swords-03": {
    upLong: { zh: "一颗红心被三把宝剑刺穿，背景是阴云和大雨。宝剑三代表心痛、悲伤和失望：分手、被背叛、一句伤人的话，或者一个让人难过的真相。痛是真实的，不需要假装没事。允许自己难过，让眼泪像雨一样落下，雨总会停的。", en: "A red heart is pierced by three swords against storm clouds and pouring rain. The Three of Swords is heartache, grief and disappointment: a breakup, a betrayal, a hurtful word, or a painful truth. The pain is real, and you don’t have to pretend you’re fine. Let yourself be sad and let the tears fall like the rain; rain always stops." },
    revLong: { zh: "逆位时，伤口正在慢慢愈合：你开始释放痛苦，原谅别人或自己，从悲伤中走出来。也可能是你在压抑伤痛，假装已经放下了。真正的放下需要先承认它，痛过才会过去。", en: "Reversed, the wound is slowly healing: you’re releasing the pain, forgiving others or yourself, and coming out of the sorrow. Or you may be holding the hurt down and pretending you’ve moved on. Truly letting go starts with admitting it; the pain passes once it’s been felt." },
    lore: { zh: "这是塔罗中最直白的画面之一，也是少数没有人物的牌。帕梅拉·科尔曼·史密斯在创作前参考过 15 世纪末意大利的索拉·布斯卡塔罗（Sola Busca），那副牌里就有一颗被三把剑刺穿的心，这张牌的构图很可能由此而来。黄金黎明体系称它为「悲伤」。", en: "This is one of the most direct images in tarot, and one of the few cards with no figures. Before drawing the deck, Pamela Colman Smith studied the Sola Busca tarot from late fifteenth-century Italy, which shows a heart pierced by three swords; the composition very likely comes from there. The Golden Dawn called it “Sorrow”." },
  },
  "swords-04": {
    upLong: { zh: "一个骑士的雕像平躺在教堂的石棺上，双手合十，墙上挂着三把剑，身下还有一把。宝剑四代表休息、恢复和暂时的撤退。经历了冲突或压力之后，你需要停下来，好好睡一觉、静一静，给身心充电。这不是逃避，而是为下一步做准备。", en: "The effigy of a knight lies on a tomb in a church, hands joined in prayer, three swords hanging on the wall above and one beneath him. The Four of Swords is rest, recovery and a temporary retreat. After conflict or stress you need to stop, sleep well, be quiet and recharge. This isn’t running away; it’s preparing for the next step." },
    revLong: { zh: "逆位时，休息出了问题：要么是该休息却停不下来，身心已经透支；要么是休息得太久，迟迟不愿重新面对。也可能是被迫停下。倾听身体的信号，找回休息与行动之间的节奏。", en: "Reversed, rest goes wrong: you need it but can’t stop and are running on empty, or you’ve rested so long you don’t want to face things again. You may also have been forced to stop. Listen to your body and find the rhythm between rest and action again." },
    lore: { zh: "画面中的人物不是真人，而是教堂里常见的墓上雕像，象征一种近乎冥想的静止。左上方的彩色玻璃窗上画着一个人跪在另一人面前，常被解读为寻求安慰或疗愈。黄金黎明体系称它为「冲突后的休息」。", en: "The figure isn’t a living person but a tomb effigy of the kind found in churches, a stillness close to meditation. The stained-glass window above shows one figure kneeling before another, often read as seeking comfort or healing. The Golden Dawn called it “Rest from Strife”." },
  },
  "swords-05": {
    upLong: { zh: "一个人得意地收起地上的宝剑，看着两个垂头丧气离开的人，天空的云被风撕得支离破碎。宝剑五代表冲突、输赢和代价。也许你赢了一场争论，却失去了关系；也许你是被打败的那一方。问问自己：这场胜利值得吗？有时候放下争执，比赢更重要。", en: "A man smugly gathers swords from the ground as two dejected figures walk away, the clouds torn ragged by wind. The Five of Swords is conflict, winning and losing, and the price paid. You may have won an argument and lost a relationship, or you may be on the losing side. Ask whether the victory is worth it; sometimes letting the fight go matters more than winning." },
    revLong: { zh: "逆位时，冲突开始平息：你可能准备和解，或者终于放下了一场无意义的争吵。也可能是过去的冲突留下了怨气，一直没有消散。如果需要道歉或原谅，现在是个好时机。", en: "Reversed, the conflict is settling: you may be ready to reconcile, or finally drop a pointless quarrel. Or resentment from an old fight may still linger. If an apology or forgiveness is needed, now is a good time." },
    lore: { zh: "画面里的「胜利者」手里拿着三把剑，地上还躺着两把，他赢得并不光彩，所以这张牌常被称为「空洞的胜利」。远处离开的两个人背对着他，象征这场胜利让他失去了同伴。黄金黎明体系称它为「失败」。", en: "The “winner” holds three swords with two more on the ground; his win is far from honourable, so the card is often called a hollow victory. The two figures walking away with their backs to him show that winning has cost him his companions. The Golden Dawn called it “Defeat”." },
  },
  "swords-06": {
    upLong: { zh: "一位船夫撑着船，载着一位裹着斗篷的女子和一个孩子驶向对岸，船上插着六把剑。船的一侧水面波动，另一侧却很平静。宝剑六代表过渡和离开困境：搬家、换环境、走出一段艰难的时期。旅程也许带着些伤感，但你正在驶向更平静的地方。", en: "A ferryman poles a boat carrying a cloaked woman and a child to the far shore, six swords standing upright in the boat. The water is rough on one side and smooth on the other. The Six of Swords is transition and leaving trouble behind: moving house, changing surroundings, coming out of a hard period. The journey may be tinged with sadness, but you are heading toward calmer waters." },
    revLong: { zh: "逆位时，过渡受阻了：想离开却走不了，或者带着太多过去的包袱，迟迟无法真正放下。也可能是你在逃避该面对的问题。卸下一些不必要的行李，路会好走很多。", en: "Reversed, the transition is stuck: you want to leave and can’t, or you carry so much from the past that you never truly let go. You may also be running from a problem you need to face. Put down some unnecessary baggage, and the way gets much easier." },
    lore: { zh: "船上插着的六把剑象征带着走的回忆和伤痛，人们并没有扔下它们，而是带着它们一起渡河。画面中人物都背对着我们，观者看不到他们的表情。黄金黎明体系称它为「应得的成功」，也就是说这段平静是熬过困难之后换来的。", en: "The six swords standing in the boat are the memories and hurts being carried; the travellers haven’t thrown them away but take them across with them. The figures all face away, so we never see their faces. The Golden Dawn called it “Earned Success”: this calm has been won by getting through hard times." },
  },
  "swords-07": {
    upLong: { zh: "一个人抱着五把剑，蹑手蹑脚地离开营地，还回头张望，身后留下了两把剑。宝剑七代表策略、隐瞒和投机取巧。它可能提醒你留意身边有人不够坦诚，也可能说的是你自己在走捷径、逃避责任。聪明可以用，但要问问自己，用的方式是不是心安理得。", en: "A man tiptoes away from a camp clutching five swords and glancing back, leaving two behind. The Seven of Swords is strategy, secrecy and cutting corners. It may warn that someone around you isn’t being honest, or point to you taking shortcuts or dodging responsibility. Use your wits, but ask whether you can live comfortably with how you’re using them." },
    revLong: { zh: "逆位时，隐瞒的事情可能会被揭开，或者你决定坦白、不再躲躲藏藏。也可能是你意识到自己一直在自欺欺人。诚实面对，往往比继续掩盖轻松得多。", en: "Reversed, something hidden may come out, or you decide to come clean and stop hiding. You may also realise you’ve been fooling yourself. Facing it honestly is usually far easier than continuing to cover it up." },
    lore: { zh: "画中人的表情带着几分得意和紧张，他没能把所有的剑都带走，暗示这种做法终究不完整、不稳定。远处营地的人还没有察觉。黄金黎明体系称它为「不稳定的努力」。", en: "The man looks both pleased and nervous, and he couldn’t carry off every sword, a hint that this approach is incomplete and unstable. The people in the distant camp haven’t noticed yet. The Golden Dawn called it “Unstable Effort”." },
  },
  "swords-08": {
    upLong: { zh: "一位女子被蒙着眼睛、绑着身体，站在八把插在地上的剑中间，脚下是水，远处是城堡。宝剑八代表被困住的感觉：觉得没有出路、无能为力。但仔细看，绳子很松，剑也没有完全围住她。很多时候，困住我们的是想法本身。试着换一个角度，你可能比自己以为的更自由。", en: "A woman stands bound and blindfolded among eight swords planted in the ground, water at her feet and a castle in the distance. The Eight of Swords is feeling trapped: no way out, nothing you can do. But look closely: the bindings are loose and the swords don’t fully surround her. Often what traps us is our own thinking. Try a different angle; you may be freer than you believe." },
    revLong: { zh: "逆位时，你开始挣脱束缚：意识到限制没有想象中那么牢固，找回了行动的力量。也可能是你越来越焦虑，被负面想法困得更紧。一次只迈一步，先解开离你最近的那根绳子。", en: "Reversed, you’re starting to break free: you see the limits aren’t as solid as they seemed and your power to act returns. Or anxiety may be tightening and negative thoughts binding you harder. Take one step at a time, starting with the nearest knot." },
    lore: { zh: "这张牌最关键的细节是「出路其实存在」：她的双脚没有被绑，剑在她身后留出了空隙，城堡也就在不远处。它常被用来讨论自我设限和「习得性无助」。黄金黎明体系称它为「被削弱的力量」。", en: "The key detail is that a way out exists: her feet are free, the swords leave a gap behind her, and the castle isn’t far. The card is often used to talk about self-imposed limits and learned helplessness. The Golden Dawn called it “Shortened Force”." },
  },
  "swords-09": {
    upLong: { zh: "一个人从床上坐起，双手捂着脸，身后的黑墙上横挂着九把剑。宝剑九代表焦虑、失眠和反复的担忧。夜深时，脑海里的担心往往被放大，比现实更可怕。你的感受是真实的，但不一定都会发生。把担心说出来、写下来，或者找人聊聊，它们会变小很多。", en: "A person sits up in bed with their face in their hands, nine swords hanging across the black wall behind. The Nine of Swords is anxiety, sleeplessness and worry going round in circles. Late at night, worries grow larger than reality. Your feelings are real, but not everything you fear will happen. Say them out loud, write them down or talk to someone, and they shrink a lot." },
    revLong: { zh: "逆位时，焦虑开始缓解：你找到了应对的方法，或者发现事情没有那么糟。也可能是担忧已经积压太久，到了需要正视的时候。如果长时间睡不好、情绪低落，寻求专业的帮助是照顾自己的方式，不是软弱。", en: "Reversed, the anxiety begins to ease: you find ways to cope, or discover things aren’t as bad as feared. Or the worry has built up so long it now needs facing. If poor sleep and low mood go on for a long time, seeking professional help is a way of caring for yourself, not a weakness." },
    lore: { zh: "剑并没有刺向这个人，而是挂在墙上，说明真正折磨她的是自己的想法。被子上绣着玫瑰和星座符号，床边刻着一场两人搏斗的浮雕，仿佛把噩梦也刻进了床里。黄金黎明体系称它为「绝望与残酷」。", en: "The swords aren’t pointed at her; they hang on the wall, so what torments her is her own thoughts. Her quilt is embroidered with roses and astrological signs, and the side of the bed is carved with two figures fighting, as if the nightmare were built into the bed itself. The Golden Dawn called it “Despair and Cruelty”." },
  },
  "swords-10": {
    upLong: { zh: "一个人脸朝下趴在地上，背上插着十把剑，天空漆黑，但远处的地平线已经泛出金色。宝剑十代表一件事彻底结束：最糟糕的时刻、一个痛苦的终点。画面看起来很沉重，但它也意味着已经跌到谷底，不会更坏了。天快亮了，新的开始正在等你。", en: "A man lies face down with ten swords in his back; the sky is black, but the horizon is already turning gold. The Ten of Swords is something ending completely: the worst moment, a painful end point. It looks heavy, but it also means you’ve hit bottom and it can’t get worse. Dawn is near, and a new beginning is waiting." },
    revLong: { zh: "逆位时，你开始从最低谷爬起来：伤口在恢复，最痛的部分已经过去。也可能是你在拒绝接受一个已经结束的事实，迟迟不肯让它过去。承认结束，才能真正开始恢复。", en: "Reversed, you’re climbing out of the lowest point: the wounds are healing and the worst has passed. Or you may be refusing to accept that something has ended and won’t let it go. Acknowledging the ending is what lets recovery truly begin." },
    lore: { zh: "十把剑显得有些夸张，常被解读为「一把剑就够了，十把说明这是彻底的、戏剧化的结束」，甚至带有一点自我怜悯。他的右手做出祝福的手势，远处的黎明则暗示最坏的已经过去。黄金黎明体系称它为「毁灭」。", en: "Ten swords is deliberately excessive; it’s often read as “one would have done, so ten means a total, dramatic ending”, even with a touch of self-pity. His right hand makes a gesture of blessing, and the distant dawn suggests the worst is over. The Golden Dawn called it “Ruin”." },
  },
  "swords-page": {
    upLong: { zh: "一个年轻人站在高地上，双手举着剑，回头张望，身边的云被风吹得翻滚，鸟儿在空中飞。宝剑侍从代表好奇心、求知欲和敏锐的观察力。适合学习新东西、收集信息、提出问题。保持警觉，也要记得说话之前先想一想。", en: "A young man stands on high ground, sword raised in both hands, looking over his shoulder as clouds churn in the wind and birds fly overhead. The Page of Swords is curiosity, a hunger for knowledge and sharp observation. It’s a good time to learn, gather information and ask questions. Stay alert, and remember to think before you speak." },
    revLong: { zh: "逆位时，好奇心用偏了：可能是说话太快、口无遮拦，喜欢打探或传播流言；也可能是想法很多却不够成熟，急于争辩。给自己的观点多留一点时间，听完再说。", en: "Reversed, curiosity goes astray: speaking too fast and carelessly, prying or passing on gossip, or having lots of half-formed ideas and rushing to argue. Give your views a little more time, and listen fully before you reply." },
    lore: { zh: "宝剑宫廷牌的画面里总有风和鸟：被吹弯的树、翻卷的云、高飞的鸟，都是风元素的象征。侍从站在高处四处张望，就像一个时刻在收集情报的哨兵。", en: "The Swords court cards are always full of wind and birds: bent trees, churning clouds and birds in flight, all symbols of the Air element. The page stands on high ground looking around, like a lookout constantly gathering information." },
  },
  "swords-knight": {
    upLong: { zh: "骑士骑着一匹全速奔跑的马，高举宝剑向前冲，树木被狂风吹弯。宝剑骑士代表果断、速度和直截了当。他看清目标就立刻行动，不会犹豫，适合需要快速决断、据理力争的时刻。只是冲得太快时，别忘了身边的人能不能跟上。", en: "The knight charges at full gallop with his sword raised high, trees bending in a fierce wind. The Knight of Swords is decisiveness, speed and directness. Once he sees the goal he acts without hesitation, which suits moments that call for quick decisions or arguing your case. Just don’t forget to check whether others can keep up." },
    revLong: { zh: "逆位时，果断变成了鲁莽：说话太冲、不顾后果，或者急于证明自己是对的，伤了别人。也可能是方向不清，只是一味地冲。先慢下来，想清楚再出手。", en: "Reversed, decisiveness becomes recklessness: harsh words, ignoring consequences, or rushing to prove yourself right and hurting people. You may also be charging ahead with no clear direction. Slow down and think before you strike." },
    lore: { zh: "四位骑士中，宝剑骑士的速度最快，马几乎在飞奔。他的马鞍和外衣上装饰着蝴蝶和鸟，都是风元素的象征。这张牌常被看作「思想的骑士」，行动由理念驱动，而不是情感。", en: "Of the four knights, the Knight of Swords is the fastest; his horse is practically flying. His saddle and tunic are decorated with butterflies and birds, symbols of Air. He is often seen as the knight of the mind, driven by ideas rather than feelings." },
  },
  "swords-queen": {
    upLong: { zh: "宝剑皇后侧身坐在王座上，右手竖直地举着剑，左手向前伸出，头顶的天空晴朗。她代表清醒、独立和直率：看事情一针见血，说话真诚，不被情绪蒙蔽。这张牌鼓励你相信自己的判断，设立清晰的边界，用诚实而不刻薄的方式表达。", en: "The Queen of Swords sits in profile, her sword held upright in her right hand and her left hand extended, the sky clear above her head. She is clarity, independence and candour: she sees straight to the point, speaks honestly and isn’t clouded by emotion. Trust your own judgement, set clear boundaries, and express yourself honestly without cruelty." },
    revLong: { zh: "逆位时，清醒变成了冷硬：说话太尖锐，伤人而不自知；或者把自己封闭起来，用理性拒绝所有感受。也可能是曾经的伤害让你变得过于防备。直率和温柔并不冲突。", en: "Reversed, clarity hardens into coldness: words too sharp, hurting people without noticing, or shutting yourself away and using reason to refuse every feeling. Old hurts may have made you overly guarded. Being direct and being kind aren’t opposites." },
    lore: { zh: "她的王座上刻着蝴蝶和一个带翅膀的小天使头像，头顶只有一只鸟在高飞，象征她独立而清醒的视角。传统解读中，宝剑皇后常被看作经历过伤痛、因此更加明白事理的女性。", en: "Her throne is carved with butterflies and a winged cherub’s head, and a single bird flies high above her: an independent, clear-sighted view. Traditionally the Queen of Swords is seen as a woman who has known sorrow and has grown wiser because of it." },
  },
  "swords-king": {
    upLong: { zh: "宝剑国王端坐在王座上，正面看着我们，手中的剑微微倾斜。他代表理性、权威和公正的判断：做决定时依据事实和原则，而不是个人好恶。这张牌鼓励你用清晰的逻辑处理问题，也可能指向一位专业、可靠的顾问或权威人物。", en: "The King of Swords sits on his throne facing us directly, his sword tilted slightly. He is reason, authority and fair judgement: decisions based on facts and principles rather than personal preference. Handle the matter with clear logic; the card may also point to a professional, reliable adviser or authority figure." },
    revLong: { zh: "逆位时，理性变成了冷酷或操控：用逻辑压人、滥用权威，或者只讲道理不讲人情。也可能是判断失误、思路混乱。好的决策既需要清晰的头脑，也需要一点同理心。", en: "Reversed, reason turns cold or manipulative: using logic to overpower people, abusing authority, all principle and no humanity. Judgement may also be off and thinking muddled. Good decisions need a clear head and a little empathy too." },
    lore: { zh: "他是四位国王中唯一一位正面直视观者的，象征他公开、直接、不回避。王座后方雕着蝴蝶和新月，远处的树木静立不动，和宝剑骑士牌里的狂风形成对比：思想在他这里已经变得沉稳。", en: "He is the only one of the four kings who looks straight at the viewer: open, direct and unflinching. Butterflies and crescent moons are carved on his throne, and the trees behind him stand still, in contrast to the gale in the Knight’s card; in him the mind has become steady." },
  },
  "pentacles-01": {
    upLong: { zh: "一只手从云中伸出，托着一枚金色的星币，下方是一座开满百合的花园，一道树篱拱门通向远处的山。星币一代表实际的新机会：一份工作、一笔收入、一个可以落地的计划，或者一个照顾身体的新开始。它很具体，也很踏实，抓住它，好好经营，就会慢慢长出成果。", en: "A hand reaches from a cloud holding a golden pentacle above a garden of lilies, where an arch in the hedge leads to distant mountains. The Ace of Pentacles is a practical new opportunity: a job, income, a plan that can actually be built, or a fresh start in caring for your body. It is concrete and grounded. Take it, tend it well, and results will grow." },
    revLong: { zh: "逆位时，机会没有被好好把握：可能是计划不够实际、准备不足，或者把钱和精力花在了不该花的地方。也可能是期待的机会迟迟没来。先把基础打好，从能掌控的小事做起。", en: "Reversed, an opportunity isn’t being used well: plans that aren’t practical, poor preparation, or money and energy spent in the wrong places. An expected chance may also be slow to arrive. Lay the groundwork first, starting with small things you can control." },
    lore: { zh: "星币对应土元素，代表金钱、工作、身体和一切看得见、摸得着的东西。在早期塔罗中这个牌组叫「钱币」（Coins），韦特牌在钱币上刻了五芒星，改称「星币」（Pentacles），赋予它更多神秘学的意味。黄金黎明体系称这张牌为「土之力量的根源」。", en: "Pentacles belong to Earth: money, work, the body and everything you can see and touch. In early tarot the suit was called Coins; the Rider–Waite deck engraved a five-pointed star on each coin and renamed it Pentacles, giving it a more esoteric meaning. The Golden Dawn called this card the “Root of the Powers of Earth”." },
  },
  "pentacles-02": {
    upLong: { zh: "一个年轻人一边跳着舞步，一边抛接着两枚星币，两枚星币被一条无限符号形状的带子连在一起，身后的海上船只在大浪中起伏。星币二代表平衡与灵活应变：同时兼顾工作和生活、几件事情、收入和开支。节奏可能有点忙乱，但你有能力把它们都接住。", en: "A young man dances as he juggles two pentacles joined by a band shaped like the infinity sign, while ships ride high waves on the sea behind him. The Two of Pentacles is balance and adaptability: juggling work and life, several tasks, income and spending. The rhythm may be hectic, but you can keep everything in the air." },
    revLong: { zh: "逆位时，平衡被打破了：事情太多，开始顾此失彼；或者财务上入不敷出，压力越来越大。也可能是你一直在拖延必须做的取舍。少接一件事，比所有事都做不好更明智。", en: "Reversed, the balance slips: too much on your plate and things start to drop, or money going out faster than it comes in and pressure rising. You may also be putting off a necessary trade-off. Taking on one thing fewer is wiser than doing everything badly." },
    lore: { zh: "连接两枚星币的带子是一个躺倒的「8」，也就是无限符号，和魔术师、力量牌中的符号相同，象征无尽的循环与流动。身后起伏的海浪说明生活本来就有起落，关键是保持节奏。黄金黎明体系称它为「和谐的变化」。", en: "The band joining the two pentacles is a sideways eight, the infinity sign also seen on the Magician and Strength cards: endless flow and cycles. The rolling waves behind him show that life rises and falls; the trick is to keep your rhythm. The Golden Dawn called it “Harmonious Change”." },
  },
  "pentacles-03": {
    upLong: { zh: "一位年轻的石匠站在教堂里的长凳上工作，两个人拿着图纸站在下方和他讨论，拱门上刻着三枚星币。星币三代表团队合作、专业能力和被认可的手艺。你的技能在这里派得上用场，和不同角色的人一起配合，会把事情做得比一个人更好。", en: "A young stonemason works on a bench inside a church while two people holding plans stand below and talk with him; three pentacles are carved into the arch. The Three of Pentacles is teamwork, skill and craftsmanship that earns respect. Your abilities are needed here, and working with people in different roles will make the result better than anyone could manage alone." },
    revLong: { zh: "逆位时，合作出了问题：分工不清、沟通不畅、彼此不尊重对方的专业，或者有人不愿出力。也可能是你的能力还没被看到。把目标和分工说清楚，比各做各的更有效。", en: "Reversed, teamwork breaks down: unclear roles, poor communication, not respecting each other’s expertise, or someone not pulling their weight. Your skills may also be going unnoticed. Making goals and responsibilities clear works better than everyone doing their own thing." },
    lore: { zh: "画面中的三个人物常被解读为三种角色：动手的工匠、出资的赞助人和规划的设计者，象征一个项目需要不同能力的配合。地点设在教堂里，暗示这份工作是值得长久留下的作品。黄金黎明体系称它为「物质的成果」。", en: "The three figures are often read as three roles: the craftsman who builds, the patron who funds and the designer who plans, showing that a project needs different skills working together. Setting it in a church suggests work meant to last. The Golden Dawn called it “Material Works”." },
  },
  "pentacles-04": {
    upLong: { zh: "一个人坐在城外，双手紧紧抱着一枚星币，头上顶着一枚，脚下还踩着两枚。星币四代表守护与保存：存钱、守住已有的成果、追求安全感。适度的节制能带来稳定，但也要留意，抓得太紧会让你什么都不敢放手，也很难接受新的东西。", en: "A man sits outside a city clutching a pentacle to his chest, another balanced on his crown and two more under his feet. The Four of Pentacles is holding on and preserving: saving money, protecting what you’ve built, seeking security. Some restraint brings stability, but beware that gripping too tightly makes it hard to let anything go or let anything new in." },
    revLong: { zh: "逆位时，紧握的手开始松开：可能是学会了分享和放手，也可能是走向另一个极端，花钱失控、不再规划。还有一种可能是失去了某样一直紧紧抓着的东西。找到「守」和「用」之间的平衡。", en: "Reversed, the grip loosens: you may be learning to share and let go, or swinging to the other extreme with spending out of control and no planning. You may also lose something you held onto tightly. Find the balance between keeping and using." },
    lore: { zh: "这个人用身体的四个点「锁住」了四枚星币：头、胸口和双脚，几乎动弹不得，常被看作守财和控制欲的典型形象。他背对着城市，象征为了守住财物而把自己和他人隔开。黄金黎明体系称它为「世俗的权力」。", en: "He pins down the four pentacles with four points of his body, head, chest and both feet, and can barely move; it’s a classic image of hoarding and control. He sits with his back to the city, cutting himself off from others to guard what he has. The Golden Dawn called it “Earthly Power”." },
  },
  "pentacles-05": {
    upLong: { zh: "两个人在风雪中艰难地走着，一个拄着拐杖，一个裹着单薄的披肩，他们经过一扇亮着灯的教堂彩色窗户，窗上画着五枚星币。星币五代表困境与匮乏：经济上的压力、健康上的担忧，或者感到被排斥、无人帮助。最难熬的时候，请记得帮助可能就在身边，只是你还没有抬头去看。", en: "Two figures struggle through the snow, one on crutches and the other wrapped in a thin shawl, passing a lit stained-glass church window showing five pentacles. The Five of Pentacles is hardship and lack: money pressure, worries about health, or feeling shut out and alone. In the hardest moments, remember that help may be close by, waiting for you to look up." },
    revLong: { zh: "逆位时，困境开始好转：经济状况慢慢恢复，或者你终于愿意向别人求助，也得到了回应。也可能是你还在独自硬撑。接受帮助并不丢人，它是走出低谷最快的路之一。", en: "Reversed, hardship starts to ease: finances slowly recover, or you finally ask for help and receive it. Or you may still be struggling alone. Accepting help is nothing to be ashamed of; it’s one of the fastest ways out." },
    lore: { zh: "这张牌最常被提起的细节是：两个人从温暖明亮的窗前走过，却没有抬头。窗内象征庇护与援助，它一直都在，只是他们没有看见。黄金黎明体系称它为「物质的困境」。", en: "The detail most often noted is that the two pass beneath a warm, lit window without looking up. The window stands for shelter and help, always there yet unseen. The Golden Dawn called it “Material Trouble”." },
  },
  "pentacles-06": {
    upLong: { zh: "一位衣着体面的商人一手提着天平，一手把钱币递给跪在面前的人，旁边还跪着另一个人。星币六代表给予与接受、资源的流动和慷慨。可能是你在帮助别人，也可能是你正在得到帮助。健康的给予是平衡的，既不让人有负担，也不让自己被掏空。", en: "A well-dressed merchant holds a pair of scales in one hand and gives coins to a kneeling figure with the other, while a second person kneels nearby. The Six of Pentacles is giving and receiving, the flow of resources, and generosity. You may be helping someone, or receiving help yourself. Healthy giving is balanced: it doesn’t burden the other person or empty you out." },
    revLong: { zh: "逆位时，给予出现了失衡：一方总是在付出，另一方只是索取；或者帮助附带了条件，变成了控制。也可能是你因为欠了人情而感到不自在。留意关系中的这种不对等，必要时说清楚。", en: "Reversed, giving falls out of balance: one side always gives while the other only takes, or help comes with strings and turns into control. You may also feel uneasy about owing someone. Notice the imbalance and, if needed, talk about it plainly." },
    lore: { zh: "商人手中的天平是这张牌的关键，象征公平的分配：他不是随意施舍，而是在衡量。也有人注意到画面中的权力关系，一个站着、两个跪着，所以这张牌也常引出关于「施与受之间是否平等」的讨论。黄金黎明体系称它为「物质的成功」。", en: "The merchant’s scales are the key: fair distribution, not careless charity; he is weighing. Others point to the power dynamic, one standing and two kneeling, so the card often raises the question of whether giving and receiving are truly equal. The Golden Dawn called it “Material Success”." },
  },
  "pentacles-07": {
    upLong: { zh: "一个年轻的农夫倚着锄头，静静地看着藤蔓上长出的星币。星币七代表耐心、评估和长期投入。你已经付出了很多努力，现在是停下来看看成果的时候：哪些在生长，哪些需要调整。收获需要时间，不必急着下结论。", en: "A young farmer leans on his hoe, quietly looking at pentacles growing on a vine. The Seven of Pentacles is patience, assessment and long-term investment. You’ve worked hard; now it’s time to pause and look at the results, what is growing and what needs adjusting. Harvest takes time, so don’t rush to judge." },
    revLong: { zh: "逆位时，你可能对进展感到焦虑或失望：付出很多，回报却很少；或者急于看到结果，频繁地改变方向。也可能是投入的方向本身不对。冷静地评估一下，决定是继续耕耘，还是换一块地。", en: "Reversed, you may feel anxious or disappointed about progress: lots of effort and little return, or impatience that keeps you changing direction. The investment itself may be misdirected. Assess calmly, then decide whether to keep tending this field or move to another." },
    lore: { zh: "画面中的农夫并不是在收获，而是在中途停下来端详，这正是这张牌的核心：成长需要等待。数字 7 在小阿卡纳里常与评估、挑战和停顿有关。黄金黎明体系称它为「未竟的成功」。", en: "The farmer isn’t harvesting; he has stopped halfway to look, which is the heart of the card: growth takes waiting. Sevens in the minor arcana are often about assessment, challenge and pause. The Golden Dawn called it “Success Unfulfilled”." },
  },
  "pentacles-08": {
    upLong: { zh: "一位工匠坐在工作台前，专注地敲打着一枚星币，已经完成的几枚挂在旁边，远处是一座小镇。星币八代表专注、练习和精进手艺。现在适合沉下心来学习、打磨技能，一遍遍地重复，把一件事做好。踏实的积累会慢慢变成真正的能力。", en: "A craftsman sits at his bench, hammering a pentacle with full concentration; finished ones hang beside him, and a town lies in the distance. The Eight of Pentacles is focus, practice and mastering a craft. It’s a time to settle down to learning and honing your skills, repeating the work until it’s done well. Steady practice slowly becomes real ability." },
    revLong: { zh: "逆位时，专注出了问题：可能是追求完美到停不下来，也可能是对工作失去了兴趣，只是机械地重复。还有一种情况是急于求成，不愿意打基础。问问自己，你真正想精进的是什么。", en: "Reversed, focus goes wrong: perfectionism that won’t let you stop, or losing interest and just going through the motions. You may also be impatient and skipping the basics. Ask yourself what you actually want to get better at." },
    lore: { zh: "工匠离开小镇，在路边独自工作，象征为了专注而暂时远离喧嚣。星币一枚枚挂在柱子上，记录着他一点一滴的进步。这张牌常被看作学徒、学生和一切「练习者」的牌。黄金黎明体系称它为「审慎」。", en: "The craftsman works alone by the roadside outside the town, stepping away from the bustle to concentrate. The pentacles hung one by one on the post record his progress. The card is often seen as the card of apprentices, students and anyone who practises. The Golden Dawn called it “Prudence”." },
  },
  "pentacles-09": {
    upLong: { zh: "一位衣着华贵的女子站在葡萄园中，戴着手套的手上停着一只戴头罩的猎鹰，身边挂满了成熟的葡萄和星币。星币九代表独立、自给自足和享受劳动的成果。你靠自己的努力创造了安稳舒适的生活，可以好好享受，也为自己感到骄傲。", en: "A richly dressed woman stands in a vineyard, a hooded falcon perched on her gloved hand, ripe grapes and pentacles all around her. The Nine of Pentacles is independence, self-sufficiency and enjoying the fruits of your work. You’ve built a secure, comfortable life through your own effort; enjoy it, and be proud of yourself." },
    revLong: { zh: "逆位时，独立的底气有些动摇：可能是经济上过度依赖别人，或者为了维持表面的体面而透支。也可能是你一直在工作，却忘了享受已经拥有的东西。稳定来自量力而行，不来自别人的眼光。", en: "Reversed, the footing of independence wobbles: depending too much on others financially, or overspending to keep up appearances. You may also be working nonstop and forgetting to enjoy what you already have. Stability comes from living within your means, not from how others see you." },
    lore: { zh: "猎鹰被训练得戴上头罩、安静地停在主人手上，象征经过自律和训练后的力量；脚边的一只蜗牛则被解读为慢慢累积的耐心。她长袍上的花纹形似金星符号「♀」，暗示美与丰盛。黄金黎明体系称它为「物质的收获」。", en: "The falcon, trained to sit hooded and calm on her hand, stands for power shaped by discipline; a small snail at her feet is read as patience built slowly. The flowers on her robe resemble the symbol of Venus, suggesting beauty and abundance. The Golden Dawn called it “Material Gain”." },
  },
  "pentacles-10": {
    upLong: { zh: "一位白发老人坐在拱门下，身边有两只白狗，一对夫妇和一个孩子站在不远处，十枚星币排列在画面中。星币十代表长久的富足、家族与传承：稳定的家庭、代代相传的财富或价值观、一个可以长久依靠的基础。这是星币牌组的圆满，适合为长远打算。", en: "A white-haired old man sits beneath an archway with two white dogs, a couple and a child standing nearby, and ten pentacles arranged across the scene. The Ten of Pentacles is lasting wealth, family and legacy: a stable home, wealth or values passed down the generations, a foundation to rely on for the long term. It is the fulfilment of the suit, a good time to plan far ahead." },
    revLong: { zh: "逆位时，家庭或财务上的根基出现了问题：家族之间的矛盾、遗产纠纷，或者长期规划被打乱。也可能是你感到被家族的期待束缚。好的传承既包括财富，也包括让每个人都能安心的关系。", en: "Reversed, the foundations of family or finances crack: conflict between relatives, disputes over inheritance, or long-term plans disrupted. You may also feel bound by family expectations. A good legacy includes not only wealth but relationships where everyone feels secure." },
    lore: { zh: "十枚星币的排列方式对应卡巴拉的「生命之树」，是韦特牌中把神秘学结构藏进日常场景的典型例子。三代人同框，老人的长袍上绣着葡萄和象征性的图案，拱门上还挂着家族纹章。黄金黎明体系称它为「财富」。", en: "The ten pentacles are laid out in the pattern of the Kabbalistic Tree of Life, a classic example of the Rider–Waite deck hiding esoteric structure inside an everyday scene. Three generations share the frame, the old man’s robe is embroidered with grapes and symbols, and family coats of arms hang on the arch. The Golden Dawn called it “Wealth”." },
  },
  "pentacles-page": {
    upLong: { zh: "一个年轻人站在开阔的田野上，双手捧着一枚星币，专注地凝视着它。星币侍从代表学习、务实的计划和新的机会：一门想学的技能、一份入门的工作、一个刚起步的目标。保持好学和认真，一步一步来，脚踏实地会带你走得很远。", en: "A young man stands in an open field holding a pentacle in both hands, gazing at it intently. The Page of Pentacles is study, practical plans and new opportunities: a skill you want to learn, an entry-level job, a goal just getting started. Stay eager and diligent, take it step by step, and being grounded will carry you a long way." },
    revLong: { zh: "逆位时，学习或计划停滞了：缺乏行动、拖延，或者目标太多却没有一个真正开始。也可能是太专注于细节，忘了抬头看方向。挑一个最重要的目标，先做出第一步。", en: "Reversed, learning or plans stall: procrastination, no follow-through, or many goals and none truly begun. You may also be so absorbed in details that you forget to look at the direction. Pick the most important goal and take the first step." },
    lore: { zh: "星币侍从身后是平整的田地和茂盛的树木，脚下的土地松软，象征准备好被耕种的潜力。和其他侍从相比，他的动作最安静、最专注，体现了土元素的稳重。", en: "Behind the Page of Pentacles lie level fields and thriving trees, and the soil beneath him is soft and freshly turned, potential ready to be cultivated. Of all the pages, his pose is the quietest and most focused, showing the steadiness of Earth." },
  },
  "pentacles-knight": {
    upLong: { zh: "骑士骑着一匹厚重的黑马，静静地站在刚翻耕过的田地上，手里托着一枚星币。星币骑士代表踏实、可靠和持之以恒：按部就班地完成每一件事，不急不躁，直到看到结果。他也许不是最快的，但一定是最稳的。", en: "The knight sits on a heavy dark horse standing still in a freshly ploughed field, holding a pentacle. The Knight of Pentacles is diligence, reliability and perseverance: doing each task in order, without haste, until the job is done. He may not be the fastest, but he is certainly the steadiest." },
    revLong: { zh: "逆位时，稳重变成了停滞：做事太保守、不愿冒任何风险，或者陷入枯燥的重复，失去了动力。也可能是变得懒散，该做的事一直在拖。在坚持之外，偶尔也给自己一点新鲜感。", en: "Reversed, steadiness becomes stagnation: too cautious to take any risk, stuck in dull routine and losing motivation, or turning lazy and putting things off. Alongside persistence, give yourself a little novelty now and then." },
    lore: { zh: "他是四位骑士中唯一一位马匹完全静止的，与权杖骑士的扬蹄、宝剑骑士的飞奔形成鲜明对比，体现了土元素的耐心与沉稳。马头和头盔上都装饰着绿叶，呼应着土地的生长。", en: "He is the only knight whose horse stands completely still, a sharp contrast with the rearing horse of Wands and the galloping horse of Swords, showing Earth’s patience and steadiness. Green leaves decorate both the horse’s head and his helmet, echoing the growth of the land." },
  },
  "pentacles-queen": {
    upLong: { zh: "星币皇后坐在花园里的王座上，膝上捧着一枚星币，头顶是玫瑰花架，脚边的草丛里蹲着一只兔子。她代表务实的关怀、富足和照顾生活的能力：把家打理得舒适，把身体照顾好，也让身边的人感到安心。这张牌鼓励你用实际的方式爱自己和他人。", en: "The Queen of Pentacles sits on a throne in a garden, a pentacle in her lap, roses arching overhead and a rabbit crouching in the grass at her feet. She is practical care, abundance and the ability to look after life: making a home comfortable, caring for the body, and helping those around her feel secure. Love yourself and others in practical ways." },
    revLong: { zh: "逆位时，照顾出现了失衡：要么只顾着照顾别人和工作，忽视了自己；要么过度关注物质和外表，忘了真正的需要。也可能是生活变得混乱，失去了秩序。先照顾好自己的基本需要。", en: "Reversed, care falls out of balance: looking after others and work while neglecting yourself, or focusing so much on things and appearances that real needs are forgotten. Life may also feel chaotic and disordered. Start by taking care of your own basic needs." },
    lore: { zh: "兔子在传统中象征丰饶和繁衍，王座上雕刻着羊头，呼应土象星座摩羯座，四周的花果代表大地的丰盛。她低头看着手中的星币，就像在照看一件珍贵而真实的东西。", en: "The rabbit is a traditional symbol of fertility and plenty; her throne is carved with goat heads, echoing the earth sign Capricorn, and the flowers and fruit around her show the earth’s abundance. She looks down at the pentacle in her lap as if tending something precious and real." },
  },
  "pentacles-king": {
    upLong: { zh: "星币国王坐在雕着公牛头的王座上，长袍上绣满葡萄藤，一手持权杖，一手托着星币，身后是他的城堡。他代表丰盛、稳定和成熟的财务能力：懂得经营，也懂得享受，能为自己和身边的人提供可靠的保障。这张牌鼓励你用长期的眼光管理资源。", en: "The King of Pentacles sits on a throne carved with bull heads, his robe covered in grapevines, a sceptre in one hand and a pentacle in the other, his castle behind him. He is abundance, stability and financial maturity: he knows how to build and how to enjoy, and provides reliable security for himself and those around him. Manage your resources with a long view." },
    revLong: { zh: "逆位时，富足出了问题：过于看重金钱和地位，变得固执、保守；或者财务管理失当，冒险投机。也可能是用物质来衡量一切，忽视了其他价值。财富是工具，不是目的。", en: "Reversed, abundance goes wrong: valuing money and status too much and becoming stubborn and rigid, or mismanaging finances and taking reckless gambles. You may also measure everything in material terms and overlook other values. Wealth is a tool, not the goal." },
    lore: { zh: "王座上的公牛头呼应土象星座金牛座，象征稳定与丰收；他的长袍和周围的葡萄藤几乎融为一体，说明财富已经成为他生活的一部分。在四位国王中，他代表把一个元素经营到最成熟、最丰硕的状态。", en: "The bull heads on his throne echo the earth sign Taurus: stability and harvest. His robe and the surrounding vines almost merge, as if wealth has become part of his very life. Among the four kings, he shows an element tended to its most mature and fruitful state." },
  },
};
