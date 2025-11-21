import { Feather, FontAwesome5 } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef, useState } from 'react';
import { Animated, Dimensions, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { resetOnboarding } from '../../utils/reset-onbording';

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [currentSlide, setCurrentSlide] = useState(0);
  const fadeAnim = useRef(new Animated.Value(1)).current;
  
  const screenWidth = Dimensions.get('window').width;
  const slideWidth = screenWidth - 40; // Considerando margin horizontal de 20 de cada lado

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
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start(() => {
        setCurrentSlide((prev) => (prev + 1) % carouselData.length);
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const currentItem = carouselData[currentSlide];

  return (
    <View style={styles.wrapper}>
      {/* StatusBar configurada explicitamente */}
      <StatusBar style="light" backgroundColor="#1E88E5" translucent={false} />
      
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right']}>
        <LinearGradient
          colors={['#e5edf4ff', '#ffffff', '#ffffffff']}
          style={styles.container}
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 20
            }}
          >
            {/* Header Carrossel */}
            <View style={styles.header}>
              <Animated.View style={[styles.carouselContainer, { opacity: fadeAnim }]}>
                <View style={styles.logoContainer}>
                  <View style={[styles.logo, { borderColor: currentItem.color }]}>
                    <FontAwesome5 name={currentItem.icon} size={28} color={currentItem.color} />
                  </View>
                  <View style={styles.textContainer}>
                    <Text style={[styles.appName, { color: currentItem.color }]}>
                      {currentItem.title}
                    </Text>
                    <Text style={styles.appTagline}>{currentItem.subtitle}</Text>
                  </View>
                </View>
              </Animated.View>

              <TouchableOpacity 
                style={styles.notificationButton} 
                onPress={() => resetOnboarding()}
                activeOpacity={0.7}
              >
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
                  activeOpacity={0.7}
                />
              ))}
            </View>

            {/* Hero Section com Slide de Imagens */}
            <View style={styles.heroSection}>
              <ScrollView 
                horizontal 
                pagingEnabled 
                showsHorizontalScrollIndicator={false}
                style={styles.imageSlider}
                contentContainerStyle={{ paddingRight: 20 }}
              >
                {/* Slide 1 */}
                <View style={[styles.slide, { marginLeft: 20 }]}>
                  <Image 
                    source={require('../../assets/images/slide2.png')}
                    style={styles.slideImage}
                    resizeMode="cover"
                  />
                  <View style={styles.slideOverlay}>
                    <Text style={styles.slideTitle}>Encontrando Nossa Gente</Text>
                    <Text style={styles.slideSubtitle}>
                      Unidos na missão de reunir famílias e comunidades
                    </Text>
                  </View>
                </View>

                {/* Slide 2 */}
                <View style={[styles.slide, { marginLeft: 15 }]}>
                  <Image 
                    source={require('../../assets/images/slide3.png')}
                    style={styles.slideImage}
                    resizeMode="cover"
                  />
                  <View style={styles.slideOverlay}>
                    <Text style={styles.slideTitle}>Segurança e Proteção</Text>
                    <Text style={styles.slideSubtitle}>
                      Denuncie irregularidades e ajude a construir uma Angola melhor
                    </Text>
                  </View>
                </View>

                {/* Slide 3 */}
                <View style={[styles.slide, { marginLeft: 15 }]}>
                  <Image 
                    source={require('../../assets/images/policial2.png')}
                    style={styles.slideImage}
                    resizeMode="cover"
                  />
                  <View style={styles.slideOverlay}>
                    <Text style={styles.slideTitle}>Força e Justiça</Text>
                    <Text style={styles.slideSubtitle}>
                      Trabalhamos juntos por uma sociedade mais justa e segura
                    </Text>
                  </View>
                </View>
              </ScrollView>

              {/* Indicadores dos slides */}
              <View style={styles.slideIndicators}>
                <View style={[styles.slideIndicator, styles.slideIndicatorActive]} />
                <View style={styles.slideIndicator} />
                <View style={styles.slideIndicator} />
              </View>
            </View>

            {/* Emergência */}
            <TouchableOpacity 
              style={styles.emergencySection}
              activeOpacity={0.8}
            >
              <View style={styles.emergencyContent}>
                <View style={styles.emergencyIcon}>
                  <Feather name="phone-call" size={28} color="#AF2E24" />
                </View>
                <View style={styles.emergencyTexts}>
                  <Text style={styles.emergencyTitle}>EMERGÊNCIA 24H</Text>
                  <Text style={styles.emergencyNumber}>113 • 112 • 111</Text>
                  <Text style={styles.emergencySubtitle}>Polícia • Bombeiros • Saúde</Text>
                </View>
                <Feather name="chevron-right" size={24} color="#AF2E24" />
              </View>
            </TouchableOpacity>

            {/* Ações Rápidas */}
            <View style={styles.actionsSection}>
              <Text style={styles.sectionTitle}>Ações Rápidas</Text>
              
              {/* Botão Nova Denúncia */}
              <TouchableOpacity 
                style={styles.primaryActionButton}
                onPress={() => router.push('/complaint')}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#1E88E5', '#1565C0']}
                  style={styles.primaryActionGradient}
                >
                  <View style={styles.primaryActionIcon}>
                    <Feather name="plus-circle" size={24} color="#FFF" />
                  </View>
                  <View style={styles.primaryActionText}>
                    <Text style={styles.primaryActionTitle}>Fazer Denúncia</Text>
                    <Text style={styles.primaryActionSubtitle}>
                      Registre desaparecimento, crime ou irregularidade
                    </Text>
                  </View>
                  <Feather name="arrow-right" size={20} color="#FFF" />
                </LinearGradient>
              </TouchableOpacity>

              {/* Grid de Ações Secundárias */}
              <View style={styles.secondaryActionsGrid}>
                <TouchableOpacity 
                  style={styles.secondaryActionButton}
                  onPress={() => router.push('/complaint/tracking')}
                  activeOpacity={0.7}
                >
                  <Feather name="clock" size={20} color="#1E88E5" />
                  <Text style={styles.secondaryActionText}>Acompanhar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.secondaryActionButton}
                  onPress={() => router.push('/(tabs)/buscar')}
                  activeOpacity={0.7}
                >
                  <Feather name="search" size={20} color="#1E88E5" />
                  <Text style={styles.secondaryActionText}>Buscar</Text>
                </TouchableOpacity>
                
                <TouchableOpacity 
                  style={styles.secondaryActionButton}
                  onPress={() => router.push('/(tabs)/casos')}
                  activeOpacity={0.7}
                >
                  <Feather name="folder" size={20} color="#1E88E5" />
                  <Text style={styles.secondaryActionText}>Meus Casos</Text>
                </TouchableOpacity>
              </View>
            </View>

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
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#1E88E5',
  },
  safeArea: {
    flex: 1,
    backgroundColor: '#e5edf4ff',
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
    // Removido minHeight fixo
  },
  carouselContainer: {
    flex: 1,
    justifyContent: 'center',
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
  textContainer: {
    flex: 1,
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
    marginBottom: 25,
    height: 200,
    position: 'relative',
  },
  imageSlider: {
    flex: 1,
  },
  slide: {
    width: Dimensions.get('window').width - 55, // Mais espaço para visualizar o próximo slide
    height: 200,
    position: 'relative',
  },
  slideImage: {
    width: '100%',
    height: '100%',
    borderRadius: 20,
  },
  slideOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  slideTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 5,
  },
  slideSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.9)',
    lineHeight: 16,
  },
  slideIndicators: {
    position: 'absolute',
    bottom: 10,
    left: 20,
    flexDirection: 'row',
    gap: 6,
  },
  slideIndicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
  },
  slideIndicatorActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    width: 20,
  },
  emergencySection: {
    marginHorizontal: 20,
    marginBottom: 25,
    borderRadius: 16,
    overflow: 'hidden',
    padding: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
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
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0e3c64ff',
    marginBottom: 15,
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
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
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
  // Actions Section
  actionsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  primaryActionButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#1E88E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  primaryActionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 20,
  },
  primaryActionIcon: {
    marginRight: 16,
  },
  primaryActionText: {
    flex: 1,
  },
  primaryActionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 4,
  },
  primaryActionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 16,
  },
  secondaryActionsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  secondaryActionButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingVertical: 16,
    paddingHorizontal: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
    gap: 6,
  },
  secondaryActionText: {
    fontSize: 12,
    color: '#1E88E5',
    fontWeight: '600',
    textAlign: 'center',
  },
});