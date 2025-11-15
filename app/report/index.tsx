import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function ReportScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const personId = params.personId as string;

  const [formData, setFormData] = useState({
    name: '',
    contact: '',
    location: '',
    date: '',
    time: '',
    description: '',
    additionalInfo: ''
  });

  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  const [currentLocation, setCurrentLocation] = useState<string>('');

  // Tipos de descrição pré-definidos
  const quickDescriptions = [
    "Vi a pessoa caminhando calmamente",
    "A pessoa parecia perdida/desorientada",
    "Vi a pessoa em transporte público",
    "A pessoa estava pedindo ajuda",
    "Vi a pessoa em estabelecimento comercial",
    "A pessoa estava com outras pessoas",
    "Vi a pessoa em situação de risco"
  ];

  // Roupas pré-definidas
  const clothingOptions = [
    "Camiseta branca", "Camisa azul", "Calça jeans", "Vestido florido",
    "Short preto", "Casaco vermelho", "Uniforme escolar", "Roupas sociais",
    "Roupas esportivas", "Roupas tradicionais"
  ];

  // Estados pré-definidos
  const conditionOptions = [
    "Parecia saudável", "Parecia cansado(a)", "Parecia assustado(a)",
    "Parecia doente", "Parecia normal", "Parecia em pânico"
  ];

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      });

      if (address) {
        const locationText = `${address.street || ''} ${address.streetNumber || ''}, ${address.district || ''}`.trim();
        setCurrentLocation(locationText);
        handleInputChange('location', locationText);
      }
    } catch (error) {
      console.log('Erro ao obter localização:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleQuickDescription = (description: string) => {
    handleInputChange('description', description);
  };

  const addClothingInfo = (clothing: string) => {
    const currentInfo = formData.additionalInfo || '';
    const newInfo = currentInfo ? `${currentInfo}, ${clothing}` : `Roupas: ${clothing}`;
    handleInputChange('additionalInfo', newInfo);
  };

  const addConditionInfo = (condition: string) => {
    const currentInfo = formData.additionalInfo || '';
    const newInfo = currentInfo ? `${currentInfo}. ${condition}` : `Estado: ${condition}`;
    handleInputChange('additionalInfo', newInfo);
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('pt-BR');
      handleInputChange('date', formattedDate);
    }
  };

  const onTimeChange = (event: any, date?: Date) => {
    setShowTimePicker(false);
    if (date) {
      setSelectedTime(date);
      const formattedTime = date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      handleInputChange('time', formattedTime);
    }
  };

  const useCurrentDateTime = () => {
    const now = new Date();
    setSelectedDate(now);
    setSelectedTime(now);
    
    handleInputChange('date', now.toLocaleDateString('pt-BR'));
    handleInputChange('time', now.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    }));
  };

  const takePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua câmera para tirar fotos.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      setImages(prev => [...prev, result.assets[0].uri]);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (status !== 'granted') {
      Alert.alert('Permissão necessária', 'Precisamos de acesso à sua galeria para adicionar fotos.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 0.8,
      allowsMultipleSelection: true,
    });

    if (!result.canceled && result.assets) {
      const newImages = result.assets.map(asset => asset.uri);
      setImages(prev => [...prev, ...newImages].slice(0, 3)); // Limite de 3 imagens
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.contact || !formData.location || !formData.description) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha todos os campos obrigatórios.');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      Alert.alert(
        'Denúncia Enviada!',
        'Obrigado! Sua informação foi registrada e será analisada pela nossa equipe.',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao enviar a denúncia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
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
            <Text style={styles.detailTitle}>Fazer Denúncia</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Informação do Caso */}
          <View style={styles.caseInfo}>
            <View style={styles.caseHeader}>
              <Feather name="alert-triangle" size={20} color="#AF2E24" />
              <Text style={styles.caseTitle}>Informação Rápida - Caso #{personId || '123'}</Text>
            </View>
            <Text style={styles.caseDescription}>
              Preencha rapidamente usando os botões. Sua informação pode salvar vidas!
            </Text>
          </View>

          {/* Formulário */}
          <View style={styles.formSection}>
            {/* Seus Dados */}
            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>Seus Dados</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Seu Nome <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Como podemos te chamar?"
                  value={formData.name}
                  onChangeText={(value) => handleInputChange('name', value)}
                  placeholderTextColor="#7A8C7D"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Contato <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Telefone para contato"
                  value={formData.contact}
                  onChangeText={(value) => handleInputChange('contact', value)}
                  placeholderTextColor="#7A8C7D"
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Local e Data - OTIMIZADO */}
            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>Local e Data</Text>
              
              <View style={styles.inputGroup}>
                <View style={styles.locationHeader}>
                  <Text style={styles.label}>
                    Local <Text style={styles.required}>*</Text>
                  </Text>
                  <TouchableOpacity 
                    style={styles.autoButton}
                    onPress={getCurrentLocation}
                  >
                    <Feather name="navigation" size={14} color="#1E88E5" />
                    <Text style={styles.autoButtonText}>Usar minha localização</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.textInput}
                  placeholder="Onde você viu a pessoa?"
                  value={formData.location}
                  onChangeText={(value) => handleInputChange('location', value)}
                  placeholderTextColor="#7A8C7D"
                />
                {currentLocation && (
                  <Text style={styles.locationHint}>
                    📍 Localização atual: {currentLocation}
                  </Text>
                )}
              </View>

              <View style={styles.row}>
                <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                  <View style={styles.dateTimeHeader}>
                    <Text style={styles.label}>Data</Text>
                    <TouchableOpacity onPress={useCurrentDateTime}>
                      <Text style={styles.nowButton}>Agora</Text>
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setShowDatePicker(true)}
                  >
                    <Text style={formData.date ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                      {formData.date || 'Selecionar data'}
                    </Text>
                    <Feather name="calendar" size={18} color="#1E88E5" />
                  </TouchableOpacity>
                </View>

                <View style={[styles.inputGroup, { flex: 1 }]}>
                  <Text style={styles.label}>Hora</Text>
                  <TouchableOpacity 
                    style={styles.pickerButton}
                    onPress={() => setShowTimePicker(true)}
                  >
                    <Text style={formData.time ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                      {formData.time || 'Selecionar hora'}
                    </Text>
                    <Feather name="clock" size={18} color="#1E88E5" />
                  </TouchableOpacity>
                </View>
              </View>
            </View>

            {/* Descrição Rápida */}
            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>O que você viu?</Text>
              
              <View style={styles.quickOptionsGrid}>
                {quickDescriptions.map((desc, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.quickOptionButton}
                    onPress={() => handleQuickDescription(desc)}
                  >
                    <Text style={styles.quickOptionText}>{desc}</Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>
                  Descrição detalhada <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Conte com mais detalhes o que você observou..."
                  value={formData.description}
                  onChangeText={(value) => handleInputChange('description', value)}
                  placeholderTextColor="#7A8C7D"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Informações Adicionais Rápidas */}
            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>Detalhes Adicionais</Text>
              
              <View style={styles.quickSection}>
                <Text style={styles.quickSectionTitle}>Roupas</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  <View style={styles.chipsContainer}>
                    {clothingOptions.map((clothing, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.chip}
                        onPress={() => addClothingInfo(clothing)}
                      >
                        <Text style={styles.chipText}>+ {clothing}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.quickSection}>
                <Text style={styles.quickSectionTitle}>Estado da Pessoa</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
                  <View style={styles.chipsContainer}>
                    {conditionOptions.map((condition, index) => (
                      <TouchableOpacity
                        key={index}
                        style={styles.chip}
                        onPress={() => addConditionInfo(condition)}
                      >
                        <Text style={styles.chipText}>+ {condition}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </ScrollView>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Outras observações</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Companhias, direção, comportamentos específicos..."
                  value={formData.additionalInfo}
                  onChangeText={(value) => handleInputChange('additionalInfo', value)}
                  placeholderTextColor="#7A8C7D"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>
            </View>

            {/* Fotos Rápidas */}
            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>Fotos (Opcional)</Text>
              
              <View style={styles.photoButtonsRow}>
                <TouchableOpacity style={styles.photoActionButton} onPress={takePhoto}>
                  <Feather name="camera" size={20} color="#1E88E5" />
                  <Text style={styles.photoActionText}>Tirar Foto</Text>
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.photoActionButton} onPress={pickImage}>
                  <Feather name="image" size={20} color="#1E88E5" />
                  <Text style={styles.photoActionText}>Da Galeria</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.imagesContainer}>
                {images.map((image, index) => (
                  <View key={index} style={styles.imageWrapper}>
                    <Image source={{ uri: image }} style={styles.image} />
                    <TouchableOpacity 
                      style={styles.removeImageButton}
                      onPress={() => removeImage(index)}
                    >
                      <Feather name="x" size={16} color="#FFF" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>

            {/* Botão Enviar */}
            <TouchableOpacity 
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled
              ]}
              onPress={handleSubmit}
              disabled={isSubmitting}
            >
              <LinearGradient
                colors={isSubmitting ? ['#7A8C7D', '#7A8C7D'] : ['#1E88E5', '#1565C0']}
                style={styles.submitButtonGradient}
              >
                {isSubmitting ? (
                  <>
                    <Feather name="loader" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>ENVIANDO...</Text>
                  </>
                ) : (
                  <>
                    <Feather name="send" size={20} color="#FFF" />
                    <Text style={styles.submitButtonText}>ENVIAR INFORMAÇÃO</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="date"
            display="default"
            onChange={onDateChange}
          />
        )}

        {/* Time Picker */}
        {showTimePicker && (
          <DateTimePicker
            value={selectedTime}
            mode="time"
            display="default"
            onChange={onTimeChange}
          />
        )}
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
  caseInfo: {
    backgroundColor: 'rgba(175, 46, 36, 0.05)',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#AF2E24',
  },
  caseHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  caseTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF2E24',
    marginLeft: 8,
  },
  caseDescription: {
    fontSize: 14,
    color: '#7A8C7D',
    lineHeight: 20,
  },
  formSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  formGroup: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 15,
  },
  inputGroup: {
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0F0D',
    marginBottom: 6,
  },
  required: {
    color: '#AF2E24',
  },
  textInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#0A0F0D',
  },
  textArea: {
    minHeight: 80,
    paddingTop: 12,
  },
  // Localização automática
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  autoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  autoButtonText: {
    fontSize: 12,
    color: '#1E88E5',
    fontWeight: '500',
    marginLeft: 4,
  },
  locationHint: {
    fontSize: 12,
    color: '#7A8C7D',
    marginTop: 4,
    fontStyle: 'italic',
  },
  // Date/Time Pickers
  dateTimeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nowButton: {
    fontSize: 12,
    color: '#1E88E5',
    fontWeight: '600',
  },
  pickerButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#0A0F0D',
  },
  pickerButtonPlaceholder: {
    fontSize: 16,
    color: '#7A8C7D',
  },
  // Descrições rápidas
  quickOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  quickOptionButton: {
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.3)',
  },
  quickOptionText: {
    fontSize: 12,
    color: '#1E88E5',
    textAlign: 'center',
  },
  // Chips rápidos
  quickSection: {
    marginBottom: 16,
  },
  quickSectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0F0D',
    marginBottom: 8,
  },
  chipsScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  chipsContainer: {
    flexDirection: 'row',
    gap: 8,
    paddingRight: 20,
  },
  chip: {
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
  },
  chipText: {
    fontSize: 12,
    color: '#1E88E5',
    fontWeight: '500',
  },
  // Fotos
  photoButtonsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  photoActionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
    gap: 8,
  },
  photoActionText: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '500',
  },
  imagesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  imageWrapper: {
    position: 'relative',
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  removeImageButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#AF2E24',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Botão enviar
  submitButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 20,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
});