import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState } from 'react';
import { 
  ScrollView, 
  StyleSheet, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  View, 
  Alert, 
  Modal,
  Image 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

export default function ConsultCasesScreen() {
  const router = useRouter();
  const [biNumber, setBiNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [cases, setCases] = useState<any[]>([]);
  const [selectedCase, setSelectedCase] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);

  // Dados mockados para demonstração
  const mockCases = [
    {
      id: 1,
      caseNumber: 'CASE-2024-001',
      personName: 'Kiala Manuel',
      status: 'Em investigação',
      date: '15/12/2023',
      relationship: 'Denunciante',
      personImage: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
      details: {
        fullName: 'Kiala Manuel',
        age: 25,
        lastSeen: '15/12/2023 às 14:30',
        location: 'Luanda, Maianga',
        description: 'Estatura média, cabelo black power, usa óculos',
        status: 'Em investigação',
        updates: [
          { date: '20/12/2023', description: 'Caso registrado na polícia' },
          { date: '18/12/2023', description: 'Busca iniciada no bairro' }
        ]
      }
    },
    {
      id: 2,
      caseNumber: 'CASE-2024-002',
      personName: 'Ndola Costa',
      status: 'Em andamento',
      date: '10/12/2023',
      relationship: 'Familiar',
      personImage: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
      details: {
        fullName: 'Ndola Costa',
        age: 8,
        lastSeen: '10/12/2023 às 08:00',
        location: 'Huambo, Centro',
        description: 'Criança, vestia uniforme escolar azul',
        status: 'Em andamento',
        updates: [
          { date: '12/12/2023', description: 'Investigação em andamento' },
          { date: '11/12/2023', description: 'Registro feito na escola' }
        ]
      }
    }
  ];

  const handleSearch = async () => {
    if (!biNumber.trim()) {
      Alert.alert('Campo obrigatório', 'Por favor, digite seu número de BI.');
      return;
    }

    if (biNumber.length < 9) {
      Alert.alert('BI inválido', 'O número de BI deve ter pelo menos 9 dígitos.');
      return;
    }

    setIsLoading(true);

    try {
      // Simular busca na API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Para demonstração, sempre retorna os casos mockados
      // Em produção, aqui viria a chamada real da API
      setCases(mockCases);
      
      if (mockCases.length === 0) {
        Alert.alert('Nenhum caso encontrado', 'Não foram encontrados casos associados a este número de BI.');
      }
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível buscar os casos. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCasePress = (caseItem: any) => {
    setSelectedCase(caseItem);
    setModalVisible(true);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'em investigação':
        return '#AF2E24';
      case 'em andamento':
        return '#E8B923';
      case 'resolvido':
        return '#008C45';
      case 'arquivado':
        return '#7A8C7D';
      default:
        return '#7A8C7D';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'em investigação':
        return 'alert-triangle';
      case 'em andamento':
        return 'clock';
      case 'resolvido':
        return 'check-circle';
      case 'arquivado':
        return 'archive';
      default:
        return 'help-circle';
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <LinearGradient
        colors={['#e5edf4ff', '#ffffff', '#ffffffff']}
        style={styles.container}
      >
        <ScrollView showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <Feather name="arrow-left" size={24} color="#1E88E5" />
            </TouchableOpacity>
            <Text style={styles.detailTitle}>Consultar Casos</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Busca por BI */}
          <View style={styles.searchSection}>
            <Text style={styles.sectionTitle}>Consultar por BI</Text>
            <Text style={styles.sectionDescription}>
              Digite seu número de Bilhete de Identidade para ver os casos em que você está envolvido
            </Text>

            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Feather name="credit-card" size={20} color="#7A8C7D" />
                <TextInput
                  style={styles.textInput}
                  placeholder="Número do BI (ex: 005448899LA048)"
                  value={biNumber}
                  onChangeText={setBiNumber}
                  placeholderTextColor="#7A8C7D"
                  keyboardType="default"
                  autoCapitalize="characters"
                  maxLength={14}
                />
              </View>
              
              <TouchableOpacity 
                style={[
                  styles.searchButton,
                  isLoading && styles.searchButtonDisabled
                ]}
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
                      <Text style={styles.searchButtonText}>BUSCAR CASOS</Text>
                    </>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>

            <View style={styles.infoBox}>
              <Feather name="info" size={16} color="#1E88E5" />
              <Text style={styles.infoText}>
                Sua privacidade é respeitada. Apenas casos onde você é denunciante ou familiar serão mostrados.
              </Text>
            </View>
          </View>

          {/* Resultados */}
          {cases.length > 0 && (
            <View style={styles.resultsSection}>
              <View style={styles.resultsHeader}>
                <Text style={styles.sectionTitle}>
                  {cases.length} {cases.length === 1 ? 'Caso Encontrado' : 'Casos Encontrados'}
                </Text>
                <Text style={styles.biNumber}>BI: {biNumber}</Text>
              </View>

              <View style={styles.casesList}>
                {cases.map((caseItem) => (
                  <TouchableOpacity
                    key={caseItem.id}
                    style={styles.caseCard}
                    onPress={() => handleCasePress(caseItem)}
                  >
                    <Image
                      source={{ uri: caseItem.personImage }}
                      style={styles.caseImage}
                    />
                    
                    <View style={styles.caseInfo}>
                      <View style={styles.caseHeader}>
                        <Text style={styles.caseNumber}>{caseItem.caseNumber}</Text>
                        <View style={[
                          styles.statusBadge,
                          { backgroundColor: getStatusColor(caseItem.status) }
                        ]}>
                          <Feather 
                            name={getStatusIcon(caseItem.status)} 
                            size={12} 
                            color="#FFF" 
                          />
                          <Text style={styles.statusText}>{caseItem.status}</Text>
                        </View>
                      </View>
                      
                      <Text style={styles.personName}>{caseItem.personName}</Text>
                      
                      <View style={styles.caseDetails}>
                        <View style={styles.detailRow}>
                          <Feather name="calendar" size={12} color="#7A8C7D" />
                          <Text style={styles.detailText}>Registro: {caseItem.date}</Text>
                        </View>
                        
                        <View style={styles.detailRow}>
                          <Feather name="user" size={12} color="#7A8C7D" />
                          <Text style={styles.detailText}>Você é: {caseItem.relationship}</Text>
                        </View>
                      </View>
                    </View>
                    
                    <Feather name="chevron-right" size={20} color="#1E88E5" />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          )}

          {/* Estado vazio */}
          {biNumber && cases.length === 0 && !isLoading && (
            <View style={styles.emptyState}>
              <Feather name="folder" size={48} color="#7A8C7D" />
              <Text style={styles.emptyStateTitle}>Nenhum caso encontrado</Text>
              <Text style={styles.emptyStateText}>
                Não foram encontrados casos associados ao BI {biNumber}
              </Text>
            </View>
          )}

          {/* Informações */}
          <View style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Como funciona?</Text>
            
            <View style={styles.infoSteps}>
              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>1</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Digite seu BI</Text>
                  <Text style={styles.stepDescription}>
                    Informe seu número de Bilhete de Identidade completo
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>2</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Busque casos</Text>
                  <Text style={styles.stepDescription}>
                    Sistema busca casos onde você é denunciante ou familiar
                  </Text>
                </View>
              </View>

              <View style={styles.step}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>3</Text>
                </View>
                <View style={styles.stepContent}>
                  <Text style={styles.stepTitle}>Acompanhe</Text>
                  <Text style={styles.stepDescription}>
                    Veja detalhes e atualizações dos casos
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>

        {/* Modal de Detalhes do Caso */}
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              {selectedCase && (
                <>
                  {/* Header do Modal */}
                  <View style={styles.modalHeader}>
                    <Text style={styles.modalTitle}>Detalhes do Caso</Text>
                    <TouchableOpacity 
                      style={styles.closeButton}
                      onPress={() => setModalVisible(false)}
                    >
                      <Feather name="x" size={24} color="#7A8C7D" />
                    </TouchableOpacity>
                  </View>

                  <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                    {/* Informações da Pessoa */}
                    <View style={styles.modalSection}>
                      <View style={styles.personHeader}>
                        <Image
                          source={{ uri: selectedCase.personImage }}
                          style={styles.modalPersonImage}
                        />
                        <View style={styles.personInfo}>
                          <Text style={styles.modalPersonName}>
                            {selectedCase.details.fullName}
                          </Text>
                          <Text style={styles.modalPersonAge}>
                            {selectedCase.details.age} anos
                          </Text>
                          <View style={[
                            styles.modalStatusBadge,
                            { backgroundColor: getStatusColor(selectedCase.status) }
                          ]}>
                            <Text style={styles.modalStatusText}>
                              {selectedCase.status}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>

                    {/* Detalhes do Caso */}
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Informações do Caso</Text>
                      
                      <View style={styles.detailItem}>
                        <Feather name="hash" size={16} color="#1E88E5" />
                        <Text style={styles.detailLabel}>Número do caso:</Text>
                        <Text style={styles.detailValue}>{selectedCase.caseNumber}</Text>
                      </View>

                      <View style={styles.detailItem}>
                        <Feather name="calendar" size={16} color="#1E88E5" />
                        <Text style={styles.detailLabel}>Última vez visto:</Text>
                        <Text style={styles.detailValue}>{selectedCase.details.lastSeen}</Text>
                      </View>

                      <View style={styles.detailItem}>
                        <Feather name="map-pin" size={16} color="#1E88E5" />
                        <Text style={styles.detailLabel}>Local:</Text>
                        <Text style={styles.detailValue}>{selectedCase.details.location}</Text>
                      </View>

                      <View style={styles.detailItem}>
                        <Feather name="user" size={16} color="#1E88E5" />
                        <Text style={styles.detailLabel}>Seu vínculo:</Text>
                        <Text style={styles.detailValue}>{selectedCase.relationship}</Text>
                      </View>
                    </View>

                    {/* Descrição */}
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Descrição</Text>
                      <Text style={styles.descriptionText}>
                        {selectedCase.details.description}
                      </Text>
                    </View>

                    {/* Atualizações */}
                    <View style={styles.modalSection}>
                      <Text style={styles.modalSectionTitle}>Atualizações</Text>
                      <View style={styles.updatesList}>
                        {selectedCase.details.updates.map((update: any, index: number) => (
                          <View key={index} style={styles.updateItem}>
                            <View style={styles.updateTimeline}>
                              <View style={styles.updateDot} />
                              {index < selectedCase.details.updates.length - 1 && (
                                <View style={styles.updateLine} />
                              )}
                            </View>
                            <View style={styles.updateContent}>
                              <Text style={styles.updateDate}>{update.date}</Text>
                              <Text style={styles.updateDescription}>
                                {update.description}
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    </View>

                    {/* Ações */}
                    <View style={styles.modalSection}>
                      <TouchableOpacity style={styles.contactButton}>
                        <LinearGradient
                          colors={['#1E88E5', '#1565C0']}
                          style={styles.contactButtonGradient}
                        >
                          <Feather name="phone" size={18} color="#FFF" />
                          <Text style={styles.contactButtonText}>FALAR COM INVESTIGADOR</Text>
                        </LinearGradient>
                      </TouchableOpacity>

                      <TouchableOpacity style={styles.secondaryButton}>
                        <Feather name="message-circle" size={18} color="#1E88E5" />
                        <Text style={styles.secondaryButtonText}>ENVIAR MENSAGEM</Text>
                      </TouchableOpacity>
                    </View>
                  </ScrollView>
                </>
              )}
            </View>
          </View>
        </Modal>
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
  },
  backButton: {
    padding: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A0F0D',
  },
  searchSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E88E5',
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
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 16,
  },
  textInput: {
    flex: 1,
    marginLeft: 12,
    fontSize: 16,
    color: '#0A0F0D',
  },
  searchButton: {
    borderRadius: 12,
    overflow: 'hidden',
  },
  searchButtonDisabled: {
    opacity: 0.7,
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
    color: '#FFFFFF',
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(30, 136, 229, 0.05)',
    padding: 16,
    borderRadius: 12,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 12,
    color: '#7A8C7D',
    lineHeight: 16,
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  biNumber: {
    fontSize: 14,
    color: '#7A8C7D',
    fontWeight: '500',
  },
  casesList: {
    gap: 12,
  },
  caseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.1)',
  },
  caseImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 12,
  },
  caseInfo: {
    flex: 1,
  },
  caseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  caseNumber: {
    fontSize: 12,
    color: '#7A8C7D',
    fontWeight: '500',
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0F0D',
    marginBottom: 8,
  },
  caseDetails: {
    gap: 4,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  detailText: {
    fontSize: 12,
    color: '#7A8C7D',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0A0F0D',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 14,
    color: '#7A8C7D',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  infoSteps: {
    gap: 20,
  },
  step: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 16,
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#1E88E5',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0F0D',
    marginBottom: 4,
  },
  stepDescription: {
    fontSize: 14,
    color: '#7A8C7D',
    lineHeight: 20,
  },
  // Modal Styles
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 136, 229, 0.1)',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0A0F0D',
  },
  closeButton: {
    padding: 4,
  },
  modalScroll: {
    paddingHorizontal: 20,
  },
  modalSection: {
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 136, 229, 0.1)',
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  modalPersonImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  personInfo: {
    flex: 1,
  },
  modalPersonName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#0A0F0D',
    marginBottom: 4,
  },
  modalPersonAge: {
    fontSize: 16,
    color: '#7A8C7D',
    marginBottom: 8,
  },
  modalStatusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  modalStatusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: '#7A8C7D',
    width: 120,
  },
  detailValue: {
    fontSize: 14,
    color: '#0A0F0D',
    fontWeight: '500',
    flex: 1,
  },
  descriptionText: {
    fontSize: 14,
    color: '#7A8C7D',
    lineHeight: 20,
  },
  updatesList: {
    gap: 16,
  },
  updateItem: {
    flexDirection: 'row',
    gap: 12,
  },
  updateTimeline: {
    alignItems: 'center',
  },
  updateDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#1E88E5',
  },
  updateLine: {
    width: 2,
    height: 40,
    backgroundColor: 'rgba(30, 136, 229, 0.2)',
    marginTop: 4,
  },
  updateContent: {
    flex: 1,
    paddingBottom: 16,
  },
  updateDate: {
    fontSize: 12,
    color: '#1E88E5',
    fontWeight: '600',
    marginBottom: 4,
  },
  updateDescription: {
    fontSize: 14,
    color: '#0A0F0D',
    lineHeight: 18,
  },
  contactButton: {
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  contactButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  secondaryButton: {
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
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
});