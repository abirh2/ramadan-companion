import type { Dua } from '@/types/zikr.types'

/**
 * Comprehensive collection of duas organized by category
 * Sources: Authentic hadith collections and Islamic tradition
 */
export const DUAS: Dua[] = [
  // Morning Duas (3)
  {
    id: 'morning-protection',
    category: 'morning',
    arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    transliteration: 'Asbahna wa asbahal-mulku lillah, walhamdu lillah',
    translation: 'We have entered morning and the dominion has entered morning belonging to Allah, and praise is to Allah.',
    reference: 'Sahih Muslim 2723',
  },
  {
    id: 'morning-ayatul-kursi',
    category: 'morning',
    arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ',
    transliteration: 'Allahu la ilaha illa Huwa, Al-Hayyul-Qayyum',
    translation: 'Allah - there is no deity except Him, the Ever-Living, the Sustainer of existence. (Recite full Ayatul Kursi)',
    reference: 'Quran 2:255',
  },
  {
    id: 'morning-seek-forgiveness',
    category: 'morning',
    arabic: 'أَسْتَغْفِرُ اللَّهَ الَّذِي لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ',
    transliteration: 'Astaghfirullaha alladhi la ilaha illa Huwal-Hayyul-Qayyumu wa atubu ilayh',
    translation: 'I seek forgiveness from Allah, besides whom there is no deity, the Ever-Living, the Sustainer, and I repent to Him.',
    reference: 'Abu Dawud 1517',
  },

  // Evening Duas (3)
  {
    id: 'evening-protection',
    category: 'evening',
    arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ وَالْحَمْدُ لِلَّهِ',
    transliteration: 'Amsayna wa amsal-mulku lillah, walhamdu lillah',
    translation: 'We have entered evening and the dominion has entered evening belonging to Allah, and praise is to Allah.',
    reference: 'Sahih Muslim 2723',
  },
  {
    id: 'evening-refuge',
    category: 'evening',
    arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
    transliteration: 'A\'udhu bikalimatillahit-tammati min sharri ma khalaq',
    translation: 'I seek refuge in the perfect words of Allah from the evil of what He has created.',
    reference: 'Sahih Muslim 2708',
  },
  {
    id: 'evening-bismillah',
    category: 'evening',
    arabic: 'بِسْمِ اللَّهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
    transliteration: 'Bismillahil-ladhi la yadurru ma\'asmihi shay\'un fil-ardi wa la fis-sama\'i, wa Huwas-Sami\'ul-\'Alim',
    translation: 'In the name of Allah with whose name nothing is harmed on earth nor in the heavens, and He is the All-Hearing, the All-Knowing.',
    reference: 'Abu Dawud 5088, At-Tirmidhi 3388',
  },

  // Meal Duas (2)
  {
    id: 'before-eating',
    category: 'meals',
    arabic: 'بِسْمِ اللَّهِ',
    transliteration: 'Bismillah',
    translation: 'In the name of Allah. (If you forget, say: Bismillahi awwalahu wa akhirahu)',
    reference: 'Abu Dawud 3767, At-Tirmidhi 1858',
  },
  {
    id: 'after-eating',
    category: 'meals',
    arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ',
    transliteration: 'Alhamdulillahil-ladhi at\'amana wa saqana wa ja\'alana Muslimin',
    translation: 'Praise be to Allah who has fed us and given us drink and made us Muslims.',
    reference: 'Abu Dawud 3850, At-Tirmidhi 3458',
  },

  // Travel Duas (2)
  {
    id: 'travel-departure',
    category: 'travel',
    arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَٰذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَىٰ رَبِّنَا لَمُنقَلِبُونَ',
    transliteration: 'Subhanal-ladhi sakhkhara lana hadha wa ma kunna lahu muqrinin. Wa inna ila Rabbina lamunqalibun',
    translation: 'Glory be to Him who has subjected this to us, and we could never have it by our efforts. Surely, unto our Lord we are returning.',
    reference: 'Quran 43:13-14',
  },
  {
    id: 'travel-protection',
    category: 'travel',
    arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَٰذَا الْبِرَّ وَالتَّقْوَىٰ وَمِنَ الْعَمَلِ مَا تَرْضَىٰ',
    transliteration: 'Allahumma inna nas\'aluka fi safarina hadhal-birra wat-taqwa, wa minal-\'amali ma tarda',
    translation: 'O Allah, we ask You for righteousness and piety in this journey of ours, and deeds that please You.',
    reference: 'Sahih Muslim 1342',
  },

  // Sleep Dua (1)
  {
    id: 'before-sleep',
    category: 'sleep',
    arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    transliteration: 'Bismika Allahumma amutu wa ahya',
    translation: 'In Your name, O Allah, I die and I live.',
    reference: 'Sahih Al-Bukhari 6324',
  },

  // Home Duas (2)
  {
    id: 'entering-home',
    category: 'home',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ خَيْرَ الْمَوْلِجِ وَخَيْرَ الْمَخْرَجِ بِسْمِ اللَّهِ وَلَجْنَا وَبِسْمِ اللَّهِ خَرَجْنَا وَعَلَى اللَّهِ رَبِّنَا تَوَكَّلْنَا',
    transliteration: 'Allahumma inni as\'aluka khayral-mawliji wa khayral-makhraji, bismillahi walajna wa bismillahi kharajna, wa \'alallahi Rabbina tawakkalna',
    translation: 'O Allah, I ask You for the best entering and the best exiting. In the name of Allah we enter, in the name of Allah we leave, and upon Allah our Lord we rely.',
    reference: 'Abu Dawud 5096',
  },
  {
    id: 'leaving-home',
    category: 'home',
    arabic: 'بِسْمِ اللَّهِ تَوَكَّلْتُ عَلَى اللَّهِ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'Bismillah, tawakkaltu \'alallah, wa la hawla wa la quwwata illa billah',
    translation: 'In the name of Allah, I place my trust in Allah, and there is no power and no strength except with Allah.',
    reference: 'Abu Dawud 5095, At-Tirmidhi 3426',
  },

  // Worship Duas (3)
  {
    id: 'entering-mosque',
    category: 'worship',
    arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ',
    transliteration: 'Allahumma aftah li abwaba rahmatik',
    translation: 'O Allah, open the doors of Your mercy for me.',
    reference: 'Sahih Muslim 713',
  },
  {
    id: 'leaving-mosque',
    category: 'worship',
    arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ',
    transliteration: 'Allahumma inni as\'aluka min fadlik',
    translation: 'O Allah, I ask You from Your bounty.',
    reference: 'Sahih Muslim 713',
  },
  {
    id: 'after-wudu',
    category: 'worship',
    arabic: 'أَشْهَدُ أَنْ لَا إِلَٰهَ إِلَّا اللَّهُ وَحْدَهُ لَا شَرِيكَ لَهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
    transliteration: 'Ashhadu an la ilaha illallahu wahdahu la sharika lah, wa ashhadu anna Muhammadan \'abduhu wa rasuluh',
    translation: 'I bear witness that there is no deity except Allah alone, without partner, and I bear witness that Muhammad is His servant and Messenger.',
    reference: 'Sahih Muslim 234',
  },

  // General Duas (4)
  {
    id: 'general-forgiveness',
    category: 'general',
    arabic: 'رَبِّ اغْفِرْ لِي وَتُبْ عَلَيَّ إِنَّكَ أَنْتَ التَّوَّابُ الرَّحِيمُ',
    transliteration: 'Rabbighfir li wa tub \'alayya, innaka antat-Tawwabur-Rahim',
    translation: 'My Lord, forgive me and accept my repentance, for You are the Accepting of Repentance, the Most Merciful.',
    reference: 'Abu Dawud 1516, At-Tirmidhi 3434',
  },
  {
    id: 'general-difficulty',
    category: 'general',
    arabic: 'لَا إِلَٰهَ إِلَّا أَنْتَ سُبْحَانَكَ إِنِّي كُنْتُ مِنَ الظَّالِمِينَ',
    transliteration: 'La ilaha illa anta subhanaka inni kuntu minaz-zalimin',
    translation: 'There is no deity except You; exalted are You. Indeed, I have been of the wrongdoers.',
    reference: 'Quran 21:87, At-Tirmidhi 3505',
  },
  {
    id: 'general-gratitude',
    category: 'general',
    arabic: 'اللَّهُمَّ أَعِنِّي عَلَىٰ ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
    transliteration: 'Allahumma a\'inni \'ala dhikrika wa shukrika wa husni \'ibadatik',
    translation: 'O Allah, help me to remember You, to thank You, and to worship You in the best manner.',
    reference: 'Abu Dawud 1522',
  },
  {
    id: 'general-protection',
    category: 'general',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    transliteration: 'Hasbunallahu wa ni\'mal-wakil',
    translation: 'Sufficient for us is Allah, and He is the best Disposer of affairs.',
    reference: 'Quran 3:173',
  },
]

/**
 * Get duas by category
 */
export function getDuasByCategory(category: Dua['category']): Dua[] {
  return DUAS.filter((dua) => dua.category === category)
}

/**
 * Get all unique categories
 */
export function getDuaCategories(): Dua['category'][] {
  return ['morning', 'evening', 'meals', 'travel', 'sleep', 'home', 'worship', 'general']
}

/**
 * Get category display name
 */
export function getCategoryDisplayName(category: Dua['category']): string {
  const names: Record<Dua['category'], string> = {
    morning: 'Morning',
    evening: 'Evening',
    meals: 'Meals',
    travel: 'Travel',
    sleep: 'Sleep',
    home: 'Home',
    worship: 'Worship',
    general: 'General',
  }
  return names[category]
}

