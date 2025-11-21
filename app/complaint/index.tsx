import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ComplaintTypeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [isAnonymous, setIsAnonymous] = useState(false);

  const complaintTypes = [
    {
      id: 'missing-person',
      title: 'Desaparecimento de Pessoa',
      subtitle: 'Registrar pessoa desaparecida',
      icon: 'user-x',
      color: '#AF2E24',
      description: 'Para reportar desaparecimento de familiares, amigos ou conhecidos',
      fields: ['Dados da pessoa', 'Circunstâncias', 'Provas/fotos']
    },
    {
      id: 'common-crime',
      title: 'Crime Comum',
      subtitle: 'Furto, agressão, homicídio',
      icon: 'alert-triangle',
      color: '#1E88E5',
      description: 'Denunciar crimes como furto, roubo, agressão, homicídio e outros',
      fields: ['Tipo de crime', 'Local/data', 'Envolvidos', 'Provas']
    },
    {
      id: 'corruption',
      title: 'Corrupção / Crime Económico',
      subtitle: 'Suborno, desvio de fundos',
      icon: 'dollar-sign',
      color: '#FF8C00',
      description: 'Reportar corrupção, suborno, fraudes e irregularidades económicas',
      fields: ['Entidade envolvida', 'Irregularidade', 'Valores', 'Documentos']
    },
    {
      id: 'domestic-violence',
      title: 'Violência Doméstica',
      subtitle: 'Física, psicológica, económica',
      icon: 'shield-off',
      color: '#8B5CF6',
      description: 'Denunciar casos de violência doméstica e familiar',
      fields: ['Dados vítima/agressor', 'Tipo violência', 'Provas', 'Urgência']
    },
    {
      id: 'cyber-crime',
      title: 'Crime Informático',
      subtitle: 'Burla online, phishing, invasão',
      icon: 'smartphone',
      color: '#059669',
      description: 'Reportar crimes digitais e fraudes online',
      fields: ['Tipo de crime', 'Plataforma', 'Descrição', 'Prints/links']
    }
  ];

  const handleComplaintTypeSelect = (complaintType: any) => {
    router.push({
      pathname: '/complaint/form',
      params: { 
        type: complaintType.id,
        isAnonymous: isAnonymous.toString()
      }
    });
  };

  return (
    <View style={styles.wrapper}>
      <StatusBar style="light" backgroundColor="#1E88E5" translucent={false} />
      <SafeAreaView style={styles.safeArea} edges={['top', 'left', 'right', 'bottom']}>
        <LinearGradient
          colors={['#e5edf4ff', '#ffffff', '#ffffffff']}
          style={styles.container}
        >
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.replace('/(tabs)')}
            >
              <Feather name="arrow-left" size={24} color="#1E88E5" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Fazer Denúncia</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Informação inicial */}
          <View style={styles.infoSection}>
            <View style={styles.infoHeader}>
              <Feather name="shield" size={24} color="#1E88E5" />
              <Text style={styles.infoTitle}>Sistema Seguro de Denúncias</Text>
            </View>
            <Text style={styles.infoDescription}>
              Escolha o tipo de denúncia para preencher um formulário específico. 
              Suas informações são protegidas e tratadas com confidencialidade.
            </Text>
          </View>

          {/* Opção de anonimato */}
          <View style={styles.anonymousSection}>
            <View style={styles.anonymousHeader}>
              <View style={styles.anonymousInfo}>
                <Feather name={isAnonymous ? "eye-off" : "eye"} size={20} color="#1E88E5" />
                <Text style={styles.anonymousTitle}>
                  {isAnonymous ? 'Denúncia Anónima' : 'Denúncia Identificada'}
                </Text>
              </View>
              <Switch
                value={isAnonymous}
                onValueChange={setIsAnonymous}
                trackColor={{ false: '#E5E7EB', true: '#1E88E5' }}
                thumbColor={isAnonymous ? '#FFF' : '#f4f3f4'}
              />
            </View>
            <Text style={styles.anonymousDescription}>
              {isAnonymous 
                ? 'Sua identidade será mantida em sigilo absoluto'
                : 'Permitirá acompanhamento e contacto sobre o caso'
              }
            </Text>
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 20
            }}
          >
            {/* Tipos de Denúncia */}
            <View style={styles.typesSection}>
              <Text style={styles.sectionTitle}>Escolha o Tipo de Denúncia</Text>
              
              {complaintTypes.map((type, index) => (
                <TouchableOpacity
                  key={type.id}
                  style={styles.typeCard}
                  onPress={() => handleComplaintTypeSelect(type)}
                  activeOpacity={0.7}
                >
                  <View style={styles.typeCardContent}>
                    <View style={[styles.typeIcon, { backgroundColor: `${type.color}15` }]}>
                      <Feather name={type.icon as any} size={24} color={type.color} />
                    </View>
                    
                    <View style={styles.typeInfo}>
                      <Text style={styles.typeTitle}>{type.title}</Text>
                      <Text style={styles.typeSubtitle}>{type.subtitle}</Text>
                      <Text style={styles.typeDescription}>{type.description}</Text>
                      
                      <View style={styles.typeFields}>
                        <Text style={styles.fieldsLabel}>Campos necessários:</Text>
                        <Text style={styles.fieldsList}>{type.fields.join(' • ')}</Text>
                      </View>
                    </View>
                    
                    <Feather name="chevron-right" size={20} color="#7A8C7D" />
                  </View>
                </TouchableOpacity>
              ))}
            </View>

            {/* Informações de Segurança */}
            <View style={styles.securitySection}>
              <View style={styles.securityHeader}>
                <Feather name="lock" size={20} color="#059669" />
                <Text style={styles.securityTitle}>Segurança e Privacidade</Text>
              </View>
              
              <View style={styles.securityItems}>
                <View style={styles.securityItem}>
                  <Feather name="check-circle" size={16} color="#059669" />
                  <Text style={styles.securityText}>Dados encriptados e protegidos</Text>
                </View>
                <View style={styles.securityItem}>
                  <Feather name="check-circle" size={16} color="#059669" />
                  <Text style={styles.securityText}>Protocolo único para acompanhamento</Text>
                </View>
                <View style={styles.securityItem}>
                  <Feather name="check-circle" size={16} color="#059669" />
                  <Text style={styles.securityText}>Notificações sobre progresso do caso</Text>
                </View>
                <View style={styles.securityItem}>
                  <Feather name="check-circle" size={16} color="#059669" />
                  <Text style={styles.securityText}>Sigilo garantido em denúncias anónimas</Text>
                </View>
              </View>
            </View>

            {/* Ajuda de Emergência */}
            <View style={styles.emergencySection}>
              <View style={styles.emergencyHeader}>
                <Feather name="phone-call" size={20} color="#AF2E24" />
                <Text style={styles.emergencyTitle}>Emergência Imediata?</Text>
              </View>
              <Text style={styles.emergencyDescription}>
                Se é uma situação de emergência que requer intervenção imediata, ligue:
              </Text>
              <Text style={styles.emergencyNumbers}>
                113 (Polícia) • 112 (Bombeiros) • 111 (Saúde)
              </Text>
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
    paddingBottom: 15,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A0F0D',
  },
  infoSection: {
    backgroundColor: 'rgba(30, 136, 229, 0.05)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#1E88E5',
    marginBottom: 20,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E88E5',
    marginLeft: 8,
  },
  infoDescription: {
    fontSize: 14,
    color: '#7A8C7D',
    lineHeight: 20,
  },
  anonymousSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
    marginBottom: 20,
  },
  anonymousHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  anonymousInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  anonymousTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0F0D',
    marginLeft: 8,
  },
  anonymousDescription: {
    fontSize: 12,
    color: '#7A8C7D',
    lineHeight: 16,
  },
  typesSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A0F0D',
    marginBottom: 16,
  },
  typeCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.1)',
    marginBottom: 12,
    overflow: 'hidden',
  },
  typeCardContent: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'flex-start',
  },
  typeIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  typeInfo: {
    flex: 1,
    marginRight: 12,
  },
  typeTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0F0D',
    marginBottom: 2,
  },
  typeSubtitle: {
    fontSize: 12,
    color: '#7A8C7D',
    marginBottom: 6,
  },
  typeDescription: {
    fontSize: 14,
    color: '#0A0F0D',
    lineHeight: 18,
    marginBottom: 8,
  },
  typeFields: {
    marginTop: 4,
  },
  fieldsLabel: {
    fontSize: 10,
    color: '#7A8C7D',
    fontWeight: '600',
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  fieldsList: {
    fontSize: 11,
    color: '#7A8C7D',
    lineHeight: 14,
  },
  securitySection: {
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#059669',
    marginTop: 20,
    marginBottom: 16,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  securityTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#059669',
    marginLeft: 8,
  },
  securityItems: {
    gap: 8,
  },
  securityItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  securityText: {
    fontSize: 12,
    color: '#7A8C7D',
    marginLeft: 8,
    lineHeight: 16,
  },
  emergencySection: {
    backgroundColor: 'rgba(175, 46, 36, 0.05)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#AF2E24',
    marginBottom: 20,
  },
  emergencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF2E24',
    marginLeft: 8,
  },
  emergencyDescription: {
    fontSize: 12,
    color: '#7A8C7D',
    lineHeight: 16,
    marginBottom: 8,
  },
  emergencyNumbers: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#AF2E24',
  },
});
