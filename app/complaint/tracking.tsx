import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../services/ApiService';

export default function ComplaintTrackingScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const [protocolNumber, setProtocolNumber] = useState('');
  const [complaint, setComplaint] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Dados mockados para demonstração
  const mockComplaintData = {
    protocolNumber: 'DENUNCIA-12345678',
    type: 'Desaparecimento de Pessoa',
    status: 'Em investigação',
    submittedDate: '2024-01-15',
    lastUpdate: '2024-01-20',
    investigatorName: 'Inspector Manuel Santos',
    investigatorContact: '+244 923 456 789',
    updates: [
      {
        date: '2024-01-20',
        status: 'Em investigação',
        description: 'Caso foi encaminhado para a esquadra local. Investigação iniciada.'
      },
      {
        date: '2024-01-18',
        status: 'Documentação completa',
        description: 'Toda documentação foi analisada e aprovada.'
      },
      {
        date: '2024-01-15',
        status: 'Recebida',
        description: 'Denúncia recebida e registrada no sistema.'
      }
    ],
    nextSteps: [
      'Busca nas áreas frequentadas pela pessoa',
      'Contacto com familiares e amigos',
      'Verificação em hospitais e centros de saúde',
      'Divulgação da foto nos postos policiais'
    ]
  };

  const handleSearch = async () => {
    if (!protocolNumber.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, digite o número do protocolo.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await apiService.getComplaintByProtocol(protocolNumber.trim());
      
      if (response.success) {
        setComplaint(response.data);
      } else {
        Alert.alert(
          'Protocolo não encontrado', 
          'Verifique o número digitado. Se o problema persistir, contacte nossa equipe.'
        );
        setComplaint(null);
      }
    } catch (error) {
      console.error('Tracking search error:', error);
      
      // If it's a 404, show not found message
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes('404') || errorMessage.includes('not found')) {
        Alert.alert(
          'Protocolo não encontrado', 
          'Verifique o número digitado. Se o problema persistir, contacte nossa equipe.'
        );
        setComplaint(null);
      } else {
        // For demo purposes, fall back to mock data if API is not available
        if (protocolNumber === mockComplaintData.protocolNumber) {
          setComplaint(mockComplaintData);
        } else {
          Alert.alert('Erro', 'Erro ao buscar o protocolo. Verifique sua conexão e tente novamente.');
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const statusColors: any = {
      'Recebida': '#FF8C00',
      'Documentação completa': '#1E88E5',
      'Em investigação': '#8B5CF6',
      'Resolvida': '#059669',
      'Arquivada': '#7A8C7D'
    };
    
    return statusColors[status] || '#7A8C7D';
  };

  const getStatusIcon = (status: string) => {
    const statusIcons: any = {
      'Recebida': 'inbox',
      'Documentação completa': 'file-check',
      'Em investigação': 'search',
      'Resolvida': 'check-circle',
      'Arquivada': 'archive'
    };
    
    return statusIcons[status] || 'circle';
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
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={24} color="#1E88E5" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Acompanhar Denúncia</Text>
            <View style={{ width: 24 }} />
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 20
            }}
          >
            {/* Buscar Protocolo */}
            <View style={styles.searchSection}>
              <Text style={styles.sectionTitle}>Consultar por Protocolo</Text>
              <Text style={styles.sectionDescription}>
                Digite o número do protocolo que você recebeu ao fazer a denúncia
              </Text>

              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Feather name="search" size={20} color="#7A8C7D" />
                  <TextInput
                    style={styles.textInput}
                    placeholder="Ex: DENUNCIA-12345678"
                    value={protocolNumber}
                    onChangeText={setProtocolNumber}
                    placeholderTextColor="#7A8C7D"
                    autoCapitalize="characters"
                  />
                </View>

                <TouchableOpacity 
                  style={styles.searchButton}
                  onPress={handleSearch}
                  disabled={isLoading}
                >
                  <LinearGradient
                    colors={isLoading ? ['#7A8C7D', '#7A8C7D'] : ['#1E88E5', '#1565C0']}
                    style={styles.searchButtonGradient}
                  >
                    {isLoading ? (
                      <>
                        <Feather name="loader" size={20} color="#FFF" />
                        <Text style={styles.searchButtonText}>BUSCANDO...</Text>
                      </>
                    ) : (
                      <>
                        <Feather name="search" size={20} color="#FFF" />
                        <Text style={styles.searchButtonText}>BUSCAR</Text>
                      </>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>

              <View style={styles.infoBox}>
                <Feather name="info" size={16} color="#1E88E5" />
                <Text style={styles.infoText}>
                  O protocolo é enviado por SMS após o registro da denúncia. 
                  Guarde-o para acompanhar o progresso do seu caso.
                </Text>
              </View>
            </View>

            {/* Demonstração */}
            {!complaint && (
              <View style={styles.demoSection}>
                <Text style={styles.demoTitle}>💡 Para testar, use:</Text>
                <TouchableOpacity 
                  style={styles.demoButton}
                  onPress={() => setProtocolNumber('DENUNCIA-12345678')}
                >
                  <Text style={styles.demoButtonText}>DENUNCIA-12345678</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Resultado */}
            {complaint && (
              <View style={styles.resultSection}>
                {/* Status Atual */}
                <View style={[styles.statusCard, { borderLeftColor: getStatusColor(complaint.status) }]}>
                  <View style={styles.statusHeader}>
                    <View style={[styles.statusIcon, { backgroundColor: `${getStatusColor(complaint.status)}15` }]}>
                      <Feather name={getStatusIcon(complaint.status)} size={24} color={getStatusColor(complaint.status)} />
                    </View>
                    <View style={styles.statusInfo}>
                      <Text style={styles.statusTitle}>Status Atual</Text>
                      <Text style={[styles.statusText, { color: getStatusColor(complaint.status) }]}>
                        {complaint.status}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.statusDescription}>
                    Última atualização: {new Date(complaint.lastUpdate).toLocaleDateString('pt-BR')}
                  </Text>
                </View>

                {/* Informações Gerais */}
                <View style={styles.infoCard}>
                  <Text style={styles.cardTitle}>Informações Gerais</Text>
                  
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Protocolo:</Text>
                    <Text style={styles.infoValue}>{complaint.protocolNumber}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Tipo:</Text>
                    <Text style={styles.infoValue}>{complaint.type}</Text>
                  </View>
                  
                  <View style={styles.infoItem}>
                    <Text style={styles.infoLabel}>Data de envio:</Text>
                    <Text style={styles.infoValue}>
                      {new Date(complaint.submittedDate).toLocaleDateString('pt-BR')}
                    </Text>
                  </View>
                </View>

                {/* Investigador Responsável */}
                <View style={styles.investigatorCard}>
                  <View style={styles.investigatorHeader}>
                    <Feather name="user-check" size={20} color="#1E88E5" />
                    <Text style={styles.cardTitle}>Investigador Responsável</Text>
                  </View>
                  
                  <Text style={styles.investigatorName}>{complaint.investigatorName}</Text>
                  
                  <TouchableOpacity style={styles.contactButton}>
                    <Feather name="phone" size={16} color="#1E88E5" />
                    <Text style={styles.contactButtonText}>{complaint.investigatorContact}</Text>
                  </TouchableOpacity>
                </View>

                {/* Cronograma de Atualizações */}
                <View style={styles.timelineCard}>
                  <Text style={styles.cardTitle}>Cronograma de Atualizações</Text>
                  
                  <View style={styles.timeline}>
                    {complaint.updates.map((update: any, index: number) => (
                      <View key={index} style={styles.timelineItem}>
                        <View style={[styles.timelineDot, { backgroundColor: getStatusColor(update.status) }]} />
                        <View style={styles.timelineContent}>
                          <View style={styles.timelineHeader}>
                            <Text style={styles.timelineDate}>
                              {new Date(update.date).toLocaleDateString('pt-BR')}
                            </Text>
                            <Text style={[styles.timelineStatus, { color: getStatusColor(update.status) }]}>
                              {update.status}
                            </Text>
                          </View>
                          <Text style={styles.timelineDescription}>{update.description}</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>

                {/* Próximos Passos */}
                <View style={styles.nextStepsCard}>
                  <View style={styles.nextStepsHeader}>
                    <Feather name="target" size={20} color="#059669" />
                    <Text style={styles.cardTitle}>Próximos Passos</Text>
                  </View>
                  
                  {complaint.nextSteps.map((step: string, index: number) => (
                    <View key={index} style={styles.stepItem}>
                      <View style={styles.stepNumber}>
                        <Text style={styles.stepNumberText}>{index + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>

                {/* Ações */}
                <View style={styles.actionsCard}>
                  <Text style={styles.cardTitle}>Precisa de Ajuda?</Text>
                  
                  <TouchableOpacity style={styles.actionButton}>
                    <LinearGradient
                      colors={['#1E88E5', '#1565C0']}
                      style={styles.actionButtonGradient}
                    >
                      <Feather name="phone" size={20} color="#FFF" />
                      <Text style={styles.actionButtonText}>CONTACTAR INVESTIGADOR</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                  
                  <TouchableOpacity style={styles.secondaryActionButton}>
                    <Feather name="plus-circle" size={20} color="#1E88E5" />
                    <Text style={styles.secondaryActionText}>ADICIONAR INFORMAÇÃO</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
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
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A0F0D',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#7A8C7D',
    marginBottom: 20,
    lineHeight: 20,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 4,
    marginBottom: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#0A0F0D',
    marginLeft: 12,
    paddingVertical: 12,
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  searchButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  infoBox: {
    flexDirection: 'row',
    backgroundColor: 'rgba(30, 136, 229, 0.05)',
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#1E88E5',
  },
  infoText: {
    fontSize: 12,
    color: '#7A8C7D',
    marginLeft: 8,
    flex: 1,
    lineHeight: 16,
  },
  demoSection: {
    backgroundColor: 'rgba(255, 140, 0, 0.05)',
    marginHorizontal: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#FF8C00',
    marginBottom: 20,
  },
  demoTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FF8C00',
    marginBottom: 8,
  },
  demoButton: {
    backgroundColor: 'rgba(255, 140, 0, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 140, 0, 0.3)',
  },
  demoButtonText: {
    fontSize: 14,
    color: '#FF8C00',
    fontWeight: '600',
    textAlign: 'center',
  },
  resultSection: {
    paddingHorizontal: 20,
  },
  statusCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderLeftWidth: 4,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  statusIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  statusInfo: {
    flex: 1,
  },
  statusTitle: {
    fontSize: 14,
    color: '#7A8C7D',
    marginBottom: 2,
  },
  statusText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statusDescription: {
    fontSize: 12,
    color: '#7A8C7D',
  },
  infoCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.1)',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0F0D',
    marginBottom: 16,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: '#7A8C7D',
  },
  infoValue: {
    fontSize: 14,
    color: '#0A0F0D',
    fontWeight: '500',
  },
  investigatorCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.1)',
  },
  investigatorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  investigatorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0F0D',
    marginBottom: 12,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
    gap: 8,
  },
  contactButtonText: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '500',
  },
  timelineCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.1)',
  },
  timeline: {
    position: 'relative',
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    marginRight: 12,
  },
  timelineContent: {
    flex: 1,
  },
  timelineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 12,
    color: '#7A8C7D',
  },
  timelineStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  timelineDescription: {
    fontSize: 14,
    color: '#0A0F0D',
    lineHeight: 18,
  },
  nextStepsCard: {
    backgroundColor: 'rgba(5, 150, 105, 0.05)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(5, 150, 105, 0.2)',
  },
  nextStepsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#059669',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  stepNumberText: {
    fontSize: 12,
    color: '#FFF',
    fontWeight: 'bold',
  },
  stepText: {
    fontSize: 14,
    color: '#0A0F0D',
    flex: 1,
    lineHeight: 18,
  },
  actionsCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.1)',
  },
  actionButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  actionButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
  },
  secondaryActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderWidth: 1,
    borderColor: '#1E88E5',
    borderRadius: 12,
    gap: 8,
  },
  secondaryActionText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
});
