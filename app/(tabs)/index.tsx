import { ThemedView } from '@/components/themed-view';
import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { ThemeProvider } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef, useState } from 'react';
import { Animated, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { resetOnboarding } from '../../utils/reset-onbording';



export default function HomeScreen() {

  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  const carouselData = [
    {
      id: 1,
      title: "Monanji",
      subtitle: '"Eu sou porque nós somos"',
      icon: "hands-helping",
      color: "#1E88E5"
    },
    {
      id: 2,
      title: "1.547 Reencontros",
      subtitle: "Famílias reunidas em Angola",
      icon: "heart",
      color: "#1E88E5"
    },
    {
      id: 3,
      title: "18 Províncias",
      subtitle: "Atuamos em todo o território",
      icon: "map-pin",
      color: "#008C45"
    },
    {
      id: 4,
      title: "92% Sucesso",
      subtitle: "Taxa de casos resolvidos",
      icon: "check",
      color: "#AF2E24"
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      // Animação de fade out
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        // Muda o slide
        setCurrentSlide((prev) => (prev + 1) % carouselData.length);

        // Animação de fade in
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 4000); // Muda a cada 4 segundos

    return () => clearInterval(interval);
  }, []);

  const currentItem = carouselData[currentSlide];


  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#e5edf4ff', '#ffffff', '#ffffffff']}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>



          {/* Header Carrossel */}
          <View style={styles.header}>
            <Animated.View style={[styles.carouselContainer, { opacity: fadeAnim }]}>
              <View style={styles.logoContainer}>
                <View style={[styles.logo, { borderColor: currentItem.color }]}>
                  <FontAwesome5 name={currentItem.icon} size={28} color={currentItem.color} />
                </View>
                <View>
                  <Text style={[styles.appName, { color: currentItem.color }]}>
                    {currentItem.title}
                  </Text>
                  <Text style={styles.appTagline}>{currentItem.subtitle}</Text>
                </View>
              </View>
            </Animated.View>

            <TouchableOpacity style={styles.notificationButton} onPress={()=> resetOnboarding()}>
              <Feather name="bell" size={22} color="#1E88E5" />
              <View style={styles.notificationBadge} />
            </TouchableOpacity>
          </View>

          {/* Indicadores do Carrossel */}
          <View style={styles.carouselIndicators}>
            {carouselData.map((_, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.indicator,
                  index === currentSlide && styles.indicatorActive
                ]}
                onPress={() => {
                  setCurrentSlide(index);
                  fadeAnim.setValue(1);
                }}
              />
            ))}
          </View>

          {/* Hero Section com Padrões Africanos */}
          <View style={styles.heroSection}>
            <View
              style={styles.heroGradient}
            >
              <Text style={styles.heroTitle}>Encontrando</Text>
              <Text style={styles.heroTitle}>Nossa Gente</Text>
              <Text style={styles.heroSubtitle}>
                Unidos na missão de reunir famílias e comunidades
              </Text>

              <View style={styles.africanPattern}>
                <View style={styles.patternLine}>
                  <View style={[styles.patternDot, { backgroundColor: '#1E88E5' }]} />
                  <View style={[styles.patternDot, { backgroundColor: '#AF2E24' }]} />
                  <View style={[styles.patternDot, { backgroundColor: '#008C45' }]} />
                  <View style={[styles.patternDot, { backgroundColor: '#1E88E5' }]} />
                </View>
              </View>
            </View>
          </View>

          

          {/* Emergência */}
          <TouchableOpacity style={styles.emergencySection}>
           
              <View style={styles.emergencyContent}>
                <View style={styles.emergencyIcon}>
                  <Feather name="phone-call" size={28} color="#FFF" />
                </View>
                <View style={styles.emergencyTexts}>
                  <Text style={styles.emergencyTitle}>EMERGÊNCIA 24H</Text>
                  <Text style={styles.emergencyNumber}>113 • 112 • 111</Text>
                  <Text style={styles.emergencySubtitle}>Polícia • Bombeiros • Saúde</Text>
                </View>
                <Feather name="chevron-right" size={24} color="#FFF" />
              </View>
           
          </TouchableOpacity>

          {/* Informações Úteis */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Como Ajudar</Text>
            <View style={styles.infoGrid}>
              <View style={styles.infoItem}>
                <Feather name="eye" size={20} color="#1E88E5" />
                <Text style={styles.infoText}>Observe ao redor</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="camera" size={20} color="#1E88E5" />
                <Text style={styles.infoText}>Registre informações</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="share-2" size={20} color="#1E88E5" />
                <Text style={styles.infoText}>Compartilhe casos</Text>
              </View>
              <View style={styles.infoItem}>
                <Feather name="heart" size={20} color="#1E88E5" />
                <Text style={styles.infoText}>Ofereça apoio</Text>
              </View>
            </View>
          </View>

        </ScrollView>


      </LinearGradient>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1E88E5',
  },
  container: {
    flex: 1,
  },
  
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    minHeight: 80,
  },
  carouselContainer: {
    flex: 1,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    borderWidth: 2,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  appTagline: {
    fontSize: 12,
    color: '#7A8C7D',
    fontStyle: 'italic',
    marginTop: 2,
  },
  notificationButton: {
    padding: 8,
    position: 'relative',
  },
  notificationBadge: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#AF2E24',
  },
  carouselIndicators: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: 15,
    gap: 6,
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#7A8C7D',
    opacity: 0.5,
  },
  indicatorActive: {
    width: 20,
    backgroundColor: '#1E88E5',
    opacity: 1,
  },
  heroSection: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroGradient: {
    padding: 25,
    position: 'relative',
  },
  heroTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#0A0F0D',
    lineHeight: 32,
  },
  heroSubtitle: {
    fontSize: 14,
    color: 'rgba(10, 15, 13, 0.8)',
    marginTop: 8,
    lineHeight: 20,
  },
  africanPattern: {
    position: 'absolute',
    bottom: 15,
    right: 15,
  },
  patternLine: {
    flexDirection: 'row',
  },
  patternDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 2,
  },

  quickActions: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0e3c64ff',
    marginBottom: 15,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionButton: {
    width: '48%',
    height: 100,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.1)',
  },
  actionGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
  },
  actionGradient2: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#008C45',
  },
  actionGradient3: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#AF2E24',
  },
  actionGradient4: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 15,
    borderRadius: 16,
    backgroundColor: '#1E88E5',
  },
  actionText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#ffff',
    marginTop: 8,
  },
  urgentCases: {
    paddingHorizontal: 20,
    marginBottom: 25,

  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  seeAllText: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '500',
  },
  casesScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingBottom: 10,
  },
  urgentCard: {
    width: 280,
    backgroundColor: 'rgba(255, 255, 255, 1)',
    borderRadius: 16,
    padding: 15,
    marginRight: 15,
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.1)',
  },
  urgentImage: {
    width: 70,
    height: 70,
    borderRadius: 35,
    marginRight: 15,
  },
  urgentInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  urgentName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#ccc',
    marginBottom: 4,
  },
  urgentTime: {
    fontSize: 12,
    color: '#1E88E5',
    marginBottom: 2,
  },
  urgentLocation: {
    fontSize: 12,
    color: '#7A8C7D',
    marginBottom: 6,
  },
  urgentBadge: {
    backgroundColor: '#AF2E24',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  urgentBadgeText: {
    fontSize: 10,
    color: '#FFF',
    fontWeight: 'bold',
  },
  emergencySection: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 20,
    borderColor: 'rgba(175, 46, 36, 0.3)',
    borderWidth: 1,
  },

  emergencyContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emergencyIcon: {
    marginRight: 15,
  },
  emergencyTexts: {
    flex: 1,
  },
  emergencyTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#AF2E24',
    marginBottom: 4,
    opacity: 0.9,
  },
  emergencyNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#AF2E24',
    marginBottom: 4,
  },
  emergencySubtitle: {
    fontSize: 12,
    color: '#AF2E24',
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  infoItem: {
    width: '47%',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.1)',
  },
  infoText: {
    fontSize: 12,
    color: '#7A8C7D',
    marginLeft: 8,
    flex: 1,
  },
  bottomNav: {
    flexDirection: 'row',
    backgroundColor: 'rgba(10, 15, 13, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
  },
  navItem: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navItemActive: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 8,
  },
  navText: {
    fontSize: 11,
    color: '#7A8C7D',
    marginTop: 4,
  },
  navTextActive: {
    fontSize: 11,
    color: '#1E88E5',
    fontWeight: '600',
    marginTop: 4,
  },
  addButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: -25,
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
});