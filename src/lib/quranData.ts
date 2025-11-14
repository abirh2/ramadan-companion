/**
 * Static Quran Data
 * 
 * Contains metadata for all 114 surahs, Juz mappings, and helper functions
 * for navigation and lookup within the Quran browser feature.
 */

export interface SurahMetadata {
  number: number
  arabicName: string
  englishName: string
  englishNameTranslation: string
  numberOfAyahs: number
  revelationType: "Meccan" | "Medinan"
}

export interface JuzData {
  number: number
  startSurah: number
  startAyah: number
  endSurah: number
  endAyah: number
}

/**
 * Complete metadata for all 114 surahs of the Quran
 * Data verified against AlQuran Cloud API (https://api.alquran.cloud/v1/surah)
 */
export const SURAHS: SurahMetadata[] = [
  { number: 1, arabicName: "سُورَةُ ٱلْفَاتِحَةِ", englishName: "Al-Faatiha", englishNameTranslation: "The Opening", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 2, arabicName: "سُورَةُ البَقَرَةِ", englishName: "Al-Baqara", englishNameTranslation: "The Cow", numberOfAyahs: 286, revelationType: "Medinan" },
  { number: 3, arabicName: "سُورَةُ آلِ عِمۡرَانَ", englishName: "Aal-i-Imraan", englishNameTranslation: "The Family of Imraan", numberOfAyahs: 200, revelationType: "Medinan" },
  { number: 4, arabicName: "سُورَةُ النِّسَاءِ", englishName: "An-Nisaa", englishNameTranslation: "The Women", numberOfAyahs: 176, revelationType: "Medinan" },
  { number: 5, arabicName: "سُورَةُ المَائـِدَةِ", englishName: "Al-Maaida", englishNameTranslation: "The Table", numberOfAyahs: 120, revelationType: "Medinan" },
  { number: 6, arabicName: "سُورَةُ الأَنۡعَامِ", englishName: "Al-An'aam", englishNameTranslation: "The Cattle", numberOfAyahs: 165, revelationType: "Meccan" },
  { number: 7, arabicName: "سُورَةُ الأَعۡرَافِ", englishName: "Al-A'raaf", englishNameTranslation: "The Heights", numberOfAyahs: 206, revelationType: "Meccan" },
  { number: 8, arabicName: "سُورَةُ الأَنفَالِ", englishName: "Al-Anfaal", englishNameTranslation: "The Spoils of War", numberOfAyahs: 75, revelationType: "Medinan" },
  { number: 9, arabicName: "سُورَةُ التَّوۡبَةِ", englishName: "At-Tawba", englishNameTranslation: "The Repentance", numberOfAyahs: 129, revelationType: "Medinan" },
  { number: 10, arabicName: "سُورَةُ يُونُسَ", englishName: "Yunus", englishNameTranslation: "Jonas", numberOfAyahs: 109, revelationType: "Meccan" },
  { number: 11, arabicName: "سُورَةُ هُودٍ", englishName: "Hud", englishNameTranslation: "Hud", numberOfAyahs: 123, revelationType: "Meccan" },
  { number: 12, arabicName: "سُورَةُ يُوسُفَ", englishName: "Yusuf", englishNameTranslation: "Joseph", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 13, arabicName: "سُورَةُ الرَّعۡدِ", englishName: "Ar-Ra'd", englishNameTranslation: "The Thunder", numberOfAyahs: 43, revelationType: "Medinan" },
  { number: 14, arabicName: "سُورَةُ إِبۡرَاهِيمَ", englishName: "Ibrahim", englishNameTranslation: "Abraham", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 15, arabicName: "سُورَةُ الحِجۡرِ", englishName: "Al-Hijr", englishNameTranslation: "The Rock", numberOfAyahs: 99, revelationType: "Meccan" },
  { number: 16, arabicName: "سُورَةُ النَّحۡلِ", englishName: "An-Nahl", englishNameTranslation: "The Bee", numberOfAyahs: 128, revelationType: "Meccan" },
  { number: 17, arabicName: "سُورَةُ الإِسۡرَاءِ", englishName: "Al-Israa", englishNameTranslation: "The Night Journey", numberOfAyahs: 111, revelationType: "Meccan" },
  { number: 18, arabicName: "سُورَةُ الكَهۡفِ", englishName: "Al-Kahf", englishNameTranslation: "The Cave", numberOfAyahs: 110, revelationType: "Meccan" },
  { number: 19, arabicName: "سُورَةُ مَرۡيَمَ", englishName: "Maryam", englishNameTranslation: "Mary", numberOfAyahs: 98, revelationType: "Meccan" },
  { number: 20, arabicName: "سُورَةُ طه", englishName: "Taa-Haa", englishNameTranslation: "Taa-Haa", numberOfAyahs: 135, revelationType: "Meccan" },
  { number: 21, arabicName: "سُورَةُ الأَنبِيَاءِ", englishName: "Al-Anbiyaa", englishNameTranslation: "The Prophets", numberOfAyahs: 112, revelationType: "Meccan" },
  { number: 22, arabicName: "سُورَةُ الحَجِّ", englishName: "Al-Hajj", englishNameTranslation: "The Pilgrimage", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 23, arabicName: "سُورَةُ المُؤۡمِنُونَ", englishName: "Al-Muminoon", englishNameTranslation: "The Believers", numberOfAyahs: 118, revelationType: "Meccan" },
  { number: 24, arabicName: "سُورَةُ النُّورِ", englishName: "An-Noor", englishNameTranslation: "The Light", numberOfAyahs: 64, revelationType: "Medinan" },
  { number: 25, arabicName: "سُورَةُ الفُرۡقَانِ", englishName: "Al-Furqaan", englishNameTranslation: "The Criterion", numberOfAyahs: 77, revelationType: "Meccan" },
  { number: 26, arabicName: "سُورَةُ الشُّعَرَاءِ", englishName: "Ash-Shu'araa", englishNameTranslation: "The Poets", numberOfAyahs: 227, revelationType: "Meccan" },
  { number: 27, arabicName: "سُورَةُ النَّمۡلِ", englishName: "An-Naml", englishNameTranslation: "The Ant", numberOfAyahs: 93, revelationType: "Meccan" },
  { number: 28, arabicName: "سُورَةُ القَصَصِ", englishName: "Al-Qasas", englishNameTranslation: "The Stories", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 29, arabicName: "سُورَةُ العَنكَبُوتِ", englishName: "Al-Ankaboot", englishNameTranslation: "The Spider", numberOfAyahs: 69, revelationType: "Meccan" },
  { number: 30, arabicName: "سُورَةُ الرُّومِ", englishName: "Ar-Room", englishNameTranslation: "The Romans", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 31, arabicName: "سُورَةُ لُقۡمَانَ", englishName: "Luqman", englishNameTranslation: "Luqman", numberOfAyahs: 34, revelationType: "Meccan" },
  { number: 32, arabicName: "سُورَةُ السَّجۡدَةِ", englishName: "As-Sajda", englishNameTranslation: "The Prostration", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 33, arabicName: "سُورَةُ الأَحۡزَابِ", englishName: "Al-Ahzaab", englishNameTranslation: "The Clans", numberOfAyahs: 73, revelationType: "Medinan" },
  { number: 34, arabicName: "سُورَةُ سَبَإٍ", englishName: "Saba", englishNameTranslation: "Sheba", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 35, arabicName: "سُورَةُ فَاطِرٍ", englishName: "Faatir", englishNameTranslation: "The Originator", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 36, arabicName: "سُورَةُ يسٓ", englishName: "Yaseen", englishNameTranslation: "Yaseen", numberOfAyahs: 83, revelationType: "Meccan" },
  { number: 37, arabicName: "سُورَةُ الصَّافَّاتِ", englishName: "As-Saaffaat", englishNameTranslation: "Those drawn up in Ranks", numberOfAyahs: 182, revelationType: "Meccan" },
  { number: 38, arabicName: "سُورَةُ صٓ", englishName: "Saad", englishNameTranslation: "The letter Saad", numberOfAyahs: 88, revelationType: "Meccan" },
  { number: 39, arabicName: "سُورَةُ الزُّمَرِ", englishName: "Az-Zumar", englishNameTranslation: "The Groups", numberOfAyahs: 75, revelationType: "Meccan" },
  { number: 40, arabicName: "سُورَةُ غَافِرٍ", englishName: "Ghafir", englishNameTranslation: "The Forgiver", numberOfAyahs: 85, revelationType: "Meccan" },
  { number: 41, arabicName: "سُورَةُ فُصِّلَتۡ", englishName: "Fussilat", englishNameTranslation: "Explained in detail", numberOfAyahs: 54, revelationType: "Meccan" },
  { number: 42, arabicName: "سُورَةُ الشُّورَىٰ", englishName: "Ash-Shura", englishNameTranslation: "Consultation", numberOfAyahs: 53, revelationType: "Meccan" },
  { number: 43, arabicName: "سُورَةُ الزُّخۡرُفِ", englishName: "Az-Zukhruf", englishNameTranslation: "Ornaments of gold", numberOfAyahs: 89, revelationType: "Meccan" },
  { number: 44, arabicName: "سُورَةُ الدُّخَانِ", englishName: "Ad-Dukhaan", englishNameTranslation: "The Smoke", numberOfAyahs: 59, revelationType: "Meccan" },
  { number: 45, arabicName: "سُورَةُ الجَاثِيَةِ", englishName: "Al-Jaathiya", englishNameTranslation: "Crouching", numberOfAyahs: 37, revelationType: "Meccan" },
  { number: 46, arabicName: "سُورَةُ الأَحۡقَافِ", englishName: "Al-Ahqaf", englishNameTranslation: "The Dunes", numberOfAyahs: 35, revelationType: "Meccan" },
  { number: 47, arabicName: "سُورَةُ مُحَمَّدٍ", englishName: "Muhammad", englishNameTranslation: "Muhammad", numberOfAyahs: 38, revelationType: "Medinan" },
  { number: 48, arabicName: "سُورَةُ الفَتۡحِ", englishName: "Al-Fath", englishNameTranslation: "The Victory", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 49, arabicName: "سُورَةُ الحُجُرَاتِ", englishName: "Al-Hujuraat", englishNameTranslation: "The Inner Apartments", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 50, arabicName: "سُورَةُ قٓ", englishName: "Qaaf", englishNameTranslation: "The letter Qaaf", numberOfAyahs: 45, revelationType: "Meccan" },
  { number: 51, arabicName: "سُورَةُ الذَّارِيَاتِ", englishName: "Adh-Dhaariyat", englishNameTranslation: "The Winnowing Winds", numberOfAyahs: 60, revelationType: "Meccan" },
  { number: 52, arabicName: "سُورَةُ الطُّورِ", englishName: "At-Tur", englishNameTranslation: "The Mount", numberOfAyahs: 49, revelationType: "Meccan" },
  { number: 53, arabicName: "سُورَةُ النَّجۡمِ", englishName: "An-Najm", englishNameTranslation: "The Star", numberOfAyahs: 62, revelationType: "Meccan" },
  { number: 54, arabicName: "سُورَةُ القَمَرِ", englishName: "Al-Qamar", englishNameTranslation: "The Moon", numberOfAyahs: 55, revelationType: "Meccan" },
  { number: 55, arabicName: "سُورَةُ الرَّحۡمَٰن", englishName: "Ar-Rahmaan", englishNameTranslation: "The Beneficent", numberOfAyahs: 78, revelationType: "Medinan" },
  { number: 56, arabicName: "سُورَةُ الوَاقِعَةِ", englishName: "Al-Waaqia", englishNameTranslation: "The Inevitable", numberOfAyahs: 96, revelationType: "Meccan" },
  { number: 57, arabicName: "سُورَةُ الحَدِيدِ", englishName: "Al-Hadid", englishNameTranslation: "The Iron", numberOfAyahs: 29, revelationType: "Medinan" },
  { number: 58, arabicName: "سُورَةُ المُجَادلَةِ", englishName: "Al-Mujaadila", englishNameTranslation: "The Pleading Woman", numberOfAyahs: 22, revelationType: "Medinan" },
  { number: 59, arabicName: "سُورَةُ الحَشۡرِ", englishName: "Al-Hashr", englishNameTranslation: "The Exile", numberOfAyahs: 24, revelationType: "Medinan" },
  { number: 60, arabicName: "سُورَةُ المُمۡتَحنَةِ", englishName: "Al-Mumtahana", englishNameTranslation: "She that is to be examined", numberOfAyahs: 13, revelationType: "Medinan" },
  { number: 61, arabicName: "سُورَةُ الصَّفِّ", englishName: "As-Saff", englishNameTranslation: "The Ranks", numberOfAyahs: 14, revelationType: "Medinan" },
  { number: 62, arabicName: "سُورَةُ الجُمُعَةِ", englishName: "Al-Jumu'a", englishNameTranslation: "Friday", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 63, arabicName: "سُورَةُ المُنَافِقُونَ", englishName: "Al-Munaafiqoon", englishNameTranslation: "The Hypocrites", numberOfAyahs: 11, revelationType: "Medinan" },
  { number: 64, arabicName: "سُورَةُ التَّغَابُنِ", englishName: "At-Taghaabun", englishNameTranslation: "Mutual Disillusion", numberOfAyahs: 18, revelationType: "Medinan" },
  { number: 65, arabicName: "سُورَةُ الطَّلَاقِ", englishName: "At-Talaaq", englishNameTranslation: "Divorce", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 66, arabicName: "سُورَةُ التَّحۡرِيمِ", englishName: "At-Tahrim", englishNameTranslation: "The Prohibition", numberOfAyahs: 12, revelationType: "Medinan" },
  { number: 67, arabicName: "سُورَةُ المُلۡكِ", englishName: "Al-Mulk", englishNameTranslation: "The Sovereignty", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 68, arabicName: "سُورَةُ القَلَمِ", englishName: "Al-Qalam", englishNameTranslation: "The Pen", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 69, arabicName: "سُورَةُ الحَاقَّةِ", englishName: "Al-Haaqqa", englishNameTranslation: "The Reality", numberOfAyahs: 52, revelationType: "Meccan" },
  { number: 70, arabicName: "سُورَةُ المَعَارِجِ", englishName: "Al-Ma'aarij", englishNameTranslation: "The Ascending Stairways", numberOfAyahs: 44, revelationType: "Meccan" },
  { number: 71, arabicName: "سُورَةُ نُوحٍ", englishName: "Nooh", englishNameTranslation: "Noah", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 72, arabicName: "سُورَةُ الجِنِّ", englishName: "Al-Jinn", englishNameTranslation: "The Jinn", numberOfAyahs: 28, revelationType: "Meccan" },
  { number: 73, arabicName: "سُورَةُ المُزَّمِّلِ", englishName: "Al-Muzzammil", englishNameTranslation: "The Enshrouded One", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 74, arabicName: "سُورَةُ المُدَّثِّرِ", englishName: "Al-Muddaththir", englishNameTranslation: "The Cloaked One", numberOfAyahs: 56, revelationType: "Meccan" },
  { number: 75, arabicName: "سُورَةُ القِيَامَةِ", englishName: "Al-Qiyaama", englishNameTranslation: "The Resurrection", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 76, arabicName: "سُورَةُ الإِنسَانِ", englishName: "Al-Insaan", englishNameTranslation: "Man", numberOfAyahs: 31, revelationType: "Medinan" },
  { number: 77, arabicName: "سُورَةُ المُرۡسَلَاتِ", englishName: "Al-Mursalaat", englishNameTranslation: "The Emissaries", numberOfAyahs: 50, revelationType: "Meccan" },
  { number: 78, arabicName: "سُورَةُ النَّبَإِ", englishName: "An-Naba", englishNameTranslation: "The Announcement", numberOfAyahs: 40, revelationType: "Meccan" },
  { number: 79, arabicName: "سُورَةُ النَّازِعَاتِ", englishName: "An-Naazi'aat", englishNameTranslation: "Those who drag forth", numberOfAyahs: 46, revelationType: "Meccan" },
  { number: 80, arabicName: "سُورَةُ عَبَسَ", englishName: "Abasa", englishNameTranslation: "He frowned", numberOfAyahs: 42, revelationType: "Meccan" },
  { number: 81, arabicName: "سُورَةُ التَّكۡوِيرِ", englishName: "At-Takwir", englishNameTranslation: "The Overthrowing", numberOfAyahs: 29, revelationType: "Meccan" },
  { number: 82, arabicName: "سُورَةُ الانفِطَارِ", englishName: "Al-Infitaar", englishNameTranslation: "The Cleaving", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 83, arabicName: "سُورَةُ المُطَفِّفِينَ", englishName: "Al-Mutaffifin", englishNameTranslation: "Defrauding", numberOfAyahs: 36, revelationType: "Meccan" },
  { number: 84, arabicName: "سُورَةُ الانشِقَاقِ", englishName: "Al-Inshiqaaq", englishNameTranslation: "The Splitting Open", numberOfAyahs: 25, revelationType: "Meccan" },
  { number: 85, arabicName: "سُورَةُ البُرُوجِ", englishName: "Al-Burooj", englishNameTranslation: "The Constellations", numberOfAyahs: 22, revelationType: "Meccan" },
  { number: 86, arabicName: "سُورَةُ الطَّارِقِ", englishName: "At-Taariq", englishNameTranslation: "The Morning Star", numberOfAyahs: 17, revelationType: "Meccan" },
  { number: 87, arabicName: "سُورَةُ الأَعۡلَىٰ", englishName: "Al-A'laa", englishNameTranslation: "The Most High", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 88, arabicName: "سُورَةُ الغَاشِيَةِ", englishName: "Al-Ghaashiya", englishNameTranslation: "The Overwhelming", numberOfAyahs: 26, revelationType: "Meccan" },
  { number: 89, arabicName: "سُورَةُ الفَجۡرِ", englishName: "Al-Fajr", englishNameTranslation: "The Dawn", numberOfAyahs: 30, revelationType: "Meccan" },
  { number: 90, arabicName: "سُورَةُ البَلَدِ", englishName: "Al-Balad", englishNameTranslation: "The City", numberOfAyahs: 20, revelationType: "Meccan" },
  { number: 91, arabicName: "سُورَةُ الشَّمۡسِ", englishName: "Ash-Shams", englishNameTranslation: "The Sun", numberOfAyahs: 15, revelationType: "Meccan" },
  { number: 92, arabicName: "سُورَةُ اللَّيۡلِ", englishName: "Al-Lail", englishNameTranslation: "The Night", numberOfAyahs: 21, revelationType: "Meccan" },
  { number: 93, arabicName: "سُورَةُ الضُّحَىٰ", englishName: "Ad-Dhuhaa", englishNameTranslation: "The Morning Hours", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 94, arabicName: "سُورَةُ الشَّرۡحِ", englishName: "Ash-Sharh", englishNameTranslation: "The Consolation", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 95, arabicName: "سُورَةُ التِّينِ", englishName: "At-Tin", englishNameTranslation: "The Fig", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 96, arabicName: "سُورَةُ العَلَقِ", englishName: "Al-Alaq", englishNameTranslation: "The Clot", numberOfAyahs: 19, revelationType: "Meccan" },
  { number: 97, arabicName: "سُورَةُ القَدۡرِ", englishName: "Al-Qadr", englishNameTranslation: "The Power, Fate", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 98, arabicName: "سُورَةُ البَيِّنَةِ", englishName: "Al-Bayyina", englishNameTranslation: "The Evidence", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 99, arabicName: "سُورَةُ الزَّلۡزَلَةِ", englishName: "Az-Zalzala", englishNameTranslation: "The Earthquake", numberOfAyahs: 8, revelationType: "Medinan" },
  { number: 100, arabicName: "سُورَةُ العَادِيَاتِ", englishName: "Al-Aadiyaat", englishNameTranslation: "The Chargers", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 101, arabicName: "سُورَةُ القَارِعَةِ", englishName: "Al-Qaari'a", englishNameTranslation: "The Calamity", numberOfAyahs: 11, revelationType: "Meccan" },
  { number: 102, arabicName: "سُورَةُ التَّكَاثُرِ", englishName: "At-Takaathur", englishNameTranslation: "Competition", numberOfAyahs: 8, revelationType: "Meccan" },
  { number: 103, arabicName: "سُورَةُ العَصۡرِ", englishName: "Al-Asr", englishNameTranslation: "The Declining Day, Epoch", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 104, arabicName: "سُورَةُ الهُمَزَةِ", englishName: "Al-Humaza", englishNameTranslation: "The Traducer", numberOfAyahs: 9, revelationType: "Meccan" },
  { number: 105, arabicName: "سُورَةُ الفِيلِ", englishName: "Al-Fil", englishNameTranslation: "The Elephant", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 106, arabicName: "سُورَةُ قُرَيۡشٍ", englishName: "Quraish", englishNameTranslation: "Quraysh", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 107, arabicName: "سُورَةُ المَاعُونِ", englishName: "Al-Maa'un", englishNameTranslation: "Almsgiving", numberOfAyahs: 7, revelationType: "Meccan" },
  { number: 108, arabicName: "سُورَةُ الكَوۡثَرِ", englishName: "Al-Kawthar", englishNameTranslation: "Abundance", numberOfAyahs: 3, revelationType: "Meccan" },
  { number: 109, arabicName: "سُورَةُ الكَافِرُونَ", englishName: "Al-Kaafiroon", englishNameTranslation: "The Disbelievers", numberOfAyahs: 6, revelationType: "Meccan" },
  { number: 110, arabicName: "سُورَةُ النَّصۡرِ", englishName: "An-Nasr", englishNameTranslation: "Divine Support", numberOfAyahs: 3, revelationType: "Medinan" },
  { number: 111, arabicName: "سُورَةُ المَسَدِ", englishName: "Al-Masad", englishNameTranslation: "The Palm Fibre", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 112, arabicName: "سُورَةُ الإِخۡلَاصِ", englishName: "Al-Ikhlaas", englishNameTranslation: "Sincerity", numberOfAyahs: 4, revelationType: "Meccan" },
  { number: 113, arabicName: "سُورَةُ الفَلَقِ", englishName: "Al-Falaq", englishNameTranslation: "The Dawn", numberOfAyahs: 5, revelationType: "Meccan" },
  { number: 114, arabicName: "سُورَةُ النَّاسِ", englishName: "An-Naas", englishNameTranslation: "Mankind", numberOfAyahs: 6, revelationType: "Meccan" }
]

/**
 * Juz (section) mappings for the 30 Juz of the Quran
 * Each Juz represents approximately 1/30th of the Quran
 */
export const JUZ_DATA: JuzData[] = [
  { number: 1, startSurah: 1, startAyah: 1, endSurah: 2, endAyah: 141 },
  { number: 2, startSurah: 2, startAyah: 142, endSurah: 2, endAyah: 252 },
  { number: 3, startSurah: 2, startAyah: 253, endSurah: 3, endAyah: 92 },
  { number: 4, startSurah: 3, startAyah: 93, endSurah: 4, endAyah: 23 },
  { number: 5, startSurah: 4, startAyah: 24, endSurah: 4, endAyah: 147 },
  { number: 6, startSurah: 4, startAyah: 148, endSurah: 5, endAyah: 81 },
  { number: 7, startSurah: 5, startAyah: 82, endSurah: 6, endAyah: 110 },
  { number: 8, startSurah: 6, startAyah: 111, endSurah: 7, endAyah: 87 },
  { number: 9, startSurah: 7, startAyah: 88, endSurah: 8, endAyah: 40 },
  { number: 10, startSurah: 8, startAyah: 41, endSurah: 9, endAyah: 92 },
  { number: 11, startSurah: 9, startAyah: 93, endSurah: 11, endAyah: 5 },
  { number: 12, startSurah: 11, startAyah: 6, endSurah: 12, endAyah: 52 },
  { number: 13, startSurah: 12, startAyah: 53, endSurah: 14, endAyah: 52 },
  { number: 14, startSurah: 15, startAyah: 1, endSurah: 16, endAyah: 128 },
  { number: 15, startSurah: 17, startAyah: 1, endSurah: 18, endAyah: 74 },
  { number: 16, startSurah: 18, startAyah: 75, endSurah: 20, endAyah: 135 },
  { number: 17, startSurah: 21, startAyah: 1, endSurah: 22, endAyah: 78 },
  { number: 18, startSurah: 23, startAyah: 1, endSurah: 25, endAyah: 20 },
  { number: 19, startSurah: 25, startAyah: 21, endSurah: 27, endAyah: 55 },
  { number: 20, startSurah: 27, startAyah: 56, endSurah: 29, endAyah: 45 },
  { number: 21, startSurah: 29, startAyah: 46, endSurah: 33, endAyah: 30 },
  { number: 22, startSurah: 33, startAyah: 31, endSurah: 36, endAyah: 27 },
  { number: 23, startSurah: 36, startAyah: 28, endSurah: 39, endAyah: 31 },
  { number: 24, startSurah: 39, startAyah: 32, endSurah: 41, endAyah: 46 },
  { number: 25, startSurah: 41, startAyah: 47, endSurah: 45, endAyah: 37 },
  { number: 26, startSurah: 46, startAyah: 1, endSurah: 51, endAyah: 30 },
  { number: 27, startSurah: 51, startAyah: 31, endSurah: 57, endAyah: 29 },
  { number: 28, startSurah: 58, startAyah: 1, endSurah: 66, endAyah: 12 },
  { number: 29, startSurah: 67, startAyah: 1, endSurah: 77, endAyah: 50 },
  { number: 30, startSurah: 78, startAyah: 1, endSurah: 114, endAyah: 6 },
]

/**
 * Helper Functions
 */

/**
 * Get surah metadata by surah number
 */
export function getSurahByNumber(number: number): SurahMetadata | undefined {
  return SURAHS.find(surah => surah.number === number)
}

/**
 * Get surah metadata by English name
 */
export function getSurahByName(name: string): SurahMetadata | undefined {
  return SURAHS.find(surah => 
    surah.englishName.toLowerCase() === name.toLowerCase()
  )
}

/**
 * Get Juz data by Juz number
 */
export function getJuzByNumber(number: number): JuzData | undefined {
  return JUZ_DATA.find(juz => juz.number === number)
}

/**
 * Get which Juz a specific surah and ayah belongs to
 */
export function getJuzBySurahAndAyah(surahNumber: number, ayahNumber: number): JuzData | undefined {
  return JUZ_DATA.find(juz => {
    // Check if the surah+ayah falls within this Juz's range
    if (surahNumber < juz.startSurah || surahNumber > juz.endSurah) {
      return false
    }
    
    if (surahNumber === juz.startSurah && ayahNumber < juz.startAyah) {
      return false
    }
    
    if (surahNumber === juz.endSurah && ayahNumber > juz.endAyah) {
      return false
    }
    
    return true
  })
}

/**
 * Get all surahs that are part of a specific Juz
 */
export function getSurahsInJuz(juzNumber: number): SurahMetadata[] {
  const juz = getJuzByNumber(juzNumber)
  if (!juz) return []
  
  return SURAHS.filter(surah => 
    surah.number >= juz.startSurah && surah.number <= juz.endSurah
  )
}

/**
 * Search surahs by name (English or Arabic)
 */
export function searchSurahs(query: string): SurahMetadata[] {
  const lowerQuery = query.toLowerCase()
  
  return SURAHS.filter(surah => 
    surah.englishName.toLowerCase().includes(lowerQuery) ||
    surah.englishNameTranslation.toLowerCase().includes(lowerQuery) ||
    surah.arabicName.includes(query) ||
    surah.number.toString() === query
  )
}

/**
 * Validate if a surah number is valid (1-114)
 */
export function isValidSurahNumber(number: number): boolean {
  return number >= 1 && number <= 114
}

/**
 * Validate if an ayah number is valid for a given surah
 */
export function isValidAyahNumber(surahNumber: number, ayahNumber: number): boolean {
  const surah = getSurahByNumber(surahNumber)
  if (!surah) return false
  
  return ayahNumber >= 1 && ayahNumber <= surah.numberOfAyahs
}

/**
 * Get total number of ayahs in the Quran
 */
export function getTotalAyahs(): number {
  return SURAHS.reduce((total, surah) => total + surah.numberOfAyahs, 0)
}

/**
 * Check if a surah should display Bismillah
 * (All surahs except Surah 9 - At-Tawbah)
 */
export function shouldDisplayBismillah(surahNumber: number): boolean {
  return surahNumber !== 9
}

