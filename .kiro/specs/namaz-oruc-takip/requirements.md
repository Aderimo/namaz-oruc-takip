# Gereksinimler Dokümanı

## Giriş

Bu doküman, İslami namaz vakitleri ve oruç takibi için geliştirilecek modern, statik bir web uygulamasının gereksinimlerini tanımlar. Uygulama, GitHub Pages üzerinde barındırılacak, tamamen istemci tarafında çalışacak ve kullanıcının konumuna göre dinamik olarak namaz vakitlerini, oruç bilgilerini, dini günleri ve resmi tatilleri gösterecektir.

## Sözlük

- **Uygulama**: Namaz ve Oruç Takip Web Uygulaması
- **Konum_Servisi**: Kullanıcının IP adresine göre ülke, şehir ve saat dilimini belirleyen bileşen
- **Namaz_Modülü**: Namaz vakitlerini hesaplayan ve gösteren bileşen
- **Oruç_Modülü**: Sahur/iftar vakitlerini, Ramazan takibini ve geri sayımı yöneten bileşen
- **Takvim_Modülü**: Hicri ve Miladi takvim dönüşümü ile dini/resmi günleri gösteren bileşen
- **Önbellek_Sistemi**: API yanıtlarını localStorage'da saklayan ve yedek JSON verisi sunan bileşen
- **Tema_Yöneticisi**: Karanlık/aydınlık tema geçişini yöneten bileşen
- **Dil_Yöneticisi**: Çoklu dil desteğini (TR/EN) yöneten bileşen
- **API_İstemcisi**: Harici API'lere istek gönderen ve hata yönetimi yapan bileşen
- **Geri_Sayım_Bileşeni**: Animasyonlu geri sayım sayacını gösteren bileşen

## Gereksinimler

### Gereksinim 1: Otomatik Konum Tespiti

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, uygulamayı açtığımda konumumun otomatik tespit edilmesini istiyorum, böylece namaz vakitlerini ve oruç bilgilerini manuel giriş yapmadan görebileyim.

#### Kabul Kriterleri

1. WHEN kullanıcı uygulamayı ilk kez açtığında, THE Konum_Servisi SHALL IP tabanlı coğrafi konum API'si aracılığıyla kullanıcının ülkesini, şehrini ve saat dilimini tespit etmeli
2. WHEN konum başarıyla tespit edildiğinde, THE Uygulama SHALL tespit edilen şehir ve ülke bilgisini kullanıcı arayüzünde göstermeli
3. WHEN kullanıcı konumunu değiştirmek istediğinde, THE Uygulama SHALL manuel şehir seçimi için bir arama arayüzü sunmalı
4. IF konum tespiti başarısız olursa, THEN THE Uygulama SHALL varsayılan konum olarak İstanbul'u kullanmalı ve kullanıcıyı bilgilendirmeli
5. WHEN konum tespit edildiğinde veya değiştirildiğinde, THE Önbellek_Sistemi SHALL konum bilgisini localStorage'a kaydetmeli

### Gereksinim 2: Namaz Vakitleri Gösterimi

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, bulunduğum konuma göre günlük namaz vakitlerini görmek istiyorum, böylece namazlarımı zamanında kılabileyim.

#### Kabul Kriterleri

1. WHEN konum bilgisi mevcut olduğunda, THE Namaz_Modülü SHALL harici API aracılığıyla İmsak, Güneş, Öğle, İkindi, Akşam ve Yatsı vakitlerini almalı
2. WHEN namaz vakitleri görüntülendiğinde, THE Namaz_Modülü SHALL bir sonraki namaz vaktine kalan süreyi geri sayım olarak göstermeli
3. WHEN bir sonraki namaz vakti yaklaştığında, THE Geri_Sayım_Bileşeni SHALL animasyonlu bir geri sayım sayacı göstermeli
4. WHILE namaz vakitleri görüntülenirken, THE Namaz_Modülü SHALL mevcut namaz vaktini görsel olarak vurgulamalı
5. WHEN yeni bir gün başladığında, THE Namaz_Modülü SHALL otomatik olarak yeni günün namaz vakitlerini yüklemeli

### Gereksinim 3: Oruç Takibi ve Bilgileri

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, sahur ve iftar vakitlerini, Ramazan geri sayımını ve oruç gün sayısını görmek istiyorum, böylece orucumu düzenli takip edebileyim.

#### Kabul Kriterleri

1. WHEN konum bilgisi mevcut olduğunda, THE Oruç_Modülü SHALL günlük sahur (imsak) ve iftar (akşam) vakitlerini göstermeli
2. WHILE Ramazan ayı süresince, THE Oruç_Modülü SHALL Ramazan'ın kaçıncı günü olduğunu ve kalan gün sayısını göstermeli
3. WHEN iftar vaktine geri sayım aktifken, THE Geri_Sayım_Bileşeni SHALL iftar vaktine kalan süreyi saat, dakika ve saniye olarak animasyonlu göstermeli
4. WHEN Ramazan ayı dışındayken, THE Oruç_Modülü SHALL bir sonraki Ramazan'a kalan gün sayısını göstermeli
5. WHEN sahur vakti yaklaştığında, THE Oruç_Modülü SHALL sahur vaktine kalan süreyi geri sayım olarak göstermeli

### Gereksinim 4: Dini Günler ve Kandiller

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, yaklaşan dini günleri ve kandilleri görmek istiyorum, böylece bu özel günlere hazırlıklı olabileyim.

#### Kabul Kriterleri

1. THE Takvim_Modülü SHALL Hicri takvime göre tüm kandil gecelerini (Mevlid, Regaib, Mirac, Berat, Kadir) listelemeli
2. THE Takvim_Modülü SHALL Ramazan Bayramı, Kurban Bayramı, Hicri Yılbaşı ve Mevlid Kandili tarihlerini göstermeli
3. WHEN bir dini gün yaklaştığında, THE Takvim_Modülü SHALL yaklaşan dini günü vurgulayarak ve kalan gün sayısıyla birlikte göstermeli
4. THE Takvim_Modülü SHALL Hicri ve Miladi takvim arasında dönüşüm yapabilmeli
5. WHEN kullanıcı takvim bileşenini görüntülediğinde, THE Takvim_Modülü SHALL dini günleri takvim üzerinde işaretli olarak göstermeli

### Gereksinim 5: Resmi Tatiller

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, bulunduğum ülkenin resmi tatillerini ve Türkiye'nin ulusal bayramlarını görmek istiyorum, böylece tatil planlamalarımı yapabileyim.

#### Kabul Kriterleri

1. WHEN kullanıcının ülkesi tespit edildiğinde, THE Takvim_Modülü SHALL o ülkenin resmi tatillerini harici API aracılığıyla almalı ve göstermeli
2. THE Takvim_Modülü SHALL Türkiye'nin ulusal bayramlarını (23 Nisan, 19 Mayıs, 30 Ağustos, 29 Ekim) her zaman göstermeli
3. THE Takvim_Modülü SHALL dini bayram tatillerini (Ramazan Bayramı, Kurban Bayramı) resmi tatil olarak göstermeli
4. WHEN bir resmi tatil yaklaştığında, THE Takvim_Modülü SHALL yaklaşan tatili kalan gün sayısıyla birlikte göstermeli

### Gereksinim 6: API Yönetimi ve Yedek Sistem

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, API'ler çalışmasa bile uygulamanın temel işlevlerini kullanabilmek istiyorum, böylece her koşulda namaz vakitlerimi görebileyim.

#### Kabul Kriterleri

1. WHEN API_İstemcisi bir API'den başarılı yanıt aldığında, THE Önbellek_Sistemi SHALL yanıtı localStorage'a zaman damgasıyla birlikte kaydetmeli
2. IF bir API isteği başarısız olursa, THEN THE Önbellek_Sistemi SHALL önce localStorage'daki önbelleğe alınmış veriyi kullanmalı
3. IF hem API isteği hem de önbellek verisi mevcut değilse, THEN THE Önbellek_Sistemi SHALL yerel JSON yedek dosyasından veri yüklemeli
4. THE API_İstemcisi SHALL API isteklerinde hız sınırlaması koruması uygulamalı
5. WHEN önbellek verisi kullanıldığında, THE Uygulama SHALL kullanıcıya verinin önbellekten geldiğini ve son güncelleme zamanını göstermeli

### Gereksinim 7: Tema ve Görsel Tasarım

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, göz yormayan, İslami estetiğe sahip modern bir arayüz istiyorum, böylece uygulamayı keyifle kullanabileyim.

#### Kabul Kriterleri

1. THE Tema_Yöneticisi SHALL karanlık ve aydınlık tema arasında geçiş yapabilmeli
2. THE Uygulama SHALL yumuşak gradyan arka planlar, glassmorphism efektleri ve kart tabanlı veri gösterimi kullanmalı
3. THE Uygulama SHALL gece gökyüzü/galaksi tonlarında, yarım ay ve yıldız temalı, parıltı efektli bir renk paleti kullanmalı
4. WHEN tema değiştirildiğinde, THE Tema_Yöneticisi SHALL kullanıcı tercihini localStorage'a kaydetmeli
5. THE Uygulama SHALL tüm ekran boyutlarında (mobil, tablet, masaüstü) duyarlı tasarıma sahip olmalı

### Gereksinim 8: Çoklu Dil Desteği

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, uygulamayı Türkçe veya İngilizce kullanabilmek istiyorum, böylece tercih ettiğim dilde bilgilere erişebileyim.

#### Kabul Kriterleri

1. THE Dil_Yöneticisi SHALL Türkçe ve İngilizce dil seçeneklerini sunmalı
2. WHEN kullanıcı dil değiştirdiğinde, THE Dil_Yöneticisi SHALL tüm arayüz metinlerini seçilen dile çevirmeli
3. WHEN kullanıcı dil değiştirdiğinde, THE Dil_Yöneticisi SHALL dil tercihini localStorage'a kaydetmeli
4. WHEN uygulama ilk açıldığında, THE Dil_Yöneticisi SHALL tarayıcı dilini tespit ederek uygun dili otomatik seçmeli
5. IF tarayıcı dili desteklenmiyorsa, THEN THE Dil_Yöneticisi SHALL varsayılan dil olarak Türkçe'yi kullanmalı

### Gereksinim 9: Performans ve SEO

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, uygulamanın hızlı yüklenmesini ve arama motorlarında bulunabilir olmasını istiyorum.

#### Kabul Kriterleri

1. THE Uygulama SHALL ilk yükleme süresini 3 saniyenin altında tutmalı
2. THE Uygulama SHALL gereksiz paket bağımlılıkları kullanmadan hafif bir yapıda olmalı
3. THE Uygulama SHALL uygun meta etiketleri, Open Graph verileri ve yapılandırılmış veri ile SEO uyumlu olmalı
4. THE Uygulama SHALL GitHub Pages üzerinde statik dosya olarak dağıtılabilir şekilde Vite ile derlenebilmeli
5. THE Uygulama SHALL Lighthouse performans puanında 90 üzeri skor hedeflemeli

### Gereksinim 10: Animasyonlar ve Mikro Etkileşimler

**Kullanıcı Hikayesi:** Bir kullanıcı olarak, geri sayım ve geçiş animasyonlarının akıcı olmasını istiyorum, böylece uygulama deneyimi keyifli olsun.

#### Kabul Kriterleri

1. WHEN geri sayım sayacı aktifken, THE Geri_Sayım_Bileşeni SHALL saat, dakika ve saniye değişimlerini akıcı animasyonlarla göstermeli
2. WHEN tema veya sayfa geçişi yapıldığında, THE Uygulama SHALL yumuşak geçiş animasyonları kullanmalı
3. WHEN kartlar ve bileşenler yüklendiğinde, THE Uygulama SHALL kademeli görünüm (fade-in/slide-in) animasyonları uygulamalı
4. THE Uygulama SHALL animasyonların performansı olumsuz etkilememesi için CSS animasyonlarını ve GPU hızlandırmasını tercih etmeli
