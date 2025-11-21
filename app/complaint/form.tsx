import { Feather } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import * as Location from 'expo-location';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Alert, Image, Modal, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../services/ApiService';

export default function ComplaintFormScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  
  const complaintType = params.type as string;
  const isAnonymous = params.isAnonymous === 'true';

  // Estados gerais
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<any>({
    // Campos comuns
    date: '',
    time: '',
    location: '',
    description: '',
    reporterName: '',
    reporterContact: '',
    reporterEmail: '',
    
    // Pessoa desaparecida
    personName: '',
    personAge: '',
    personGender: '',
    relationship: '',
    lastSeenLocation: '',
    lastSeenDate: '',
    lastSeenTime: '',
    clothingDescription: '',
    lastSeenWith: '',
    
    // Crime comum
    crimeType: '',
    peopleInvolved: '',
    
    // Corrupção
    corruptionType: '',
    institution: '',
    officialName: '',
    amount: '',
    howKnown: '',
    
    // Violência doméstica
    victimName: '',
    victimAge: '',
    victimGender: '',
    relationshipWithAggressor: '',
    violenceType: '',
    frequency: '',
    childrenInvolved: '',
    needsMedicalHelp: '',
    
    // Crime cibernético
    cyberCrimeType: '',
    platform: '',
    url: '',
    contactMethod: '',
    suspectInfo: '',
  });
  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<string>('');
  
  // Estados para pickers
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTime, setSelectedTime] = useState(new Date());
  
  // Estados para pickers específicos por tipo de denúncia
  const [showCorruptionTypePicker, setShowCorruptionTypePicker] = useState(false);
  const [showGenderPicker, setShowGenderPicker] = useState(false);
  const [showViolenceTypePicker, setShowViolenceTypePicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showCyberCrimeTypePicker, setShowCyberCrimeTypePicker] = useState(false);
  
  // Estados para câmera/scanner
  const [permission, requestPermission] = useCameraPermissions();
  const [showScanner, setShowScanner] = useState(false);
  const [scanned, setScanned] = useState(false);

  // Configuração por tipo de denúncia
  const getComplaintConfig = () => {
    const configs: any = {
      'missing-person': {
        title: 'Desaparecimento de Pessoa',
        steps: ['Dados da Pessoa', 'Circunstâncias', 'Contactos'],
        totalSteps: 3,
        color: '#AF2E24',
        icon: 'user-x'
      },
      'common-crime': {
        title: 'Crime Comum',
        steps: ['Tipo de Crime', 'Local e Data', 'Detalhes'],
        totalSteps: 3,
        color: '#1E88E5',
        icon: 'alert-triangle'
      },
      'corruption': {
        title: 'Corrupção / Crime Económico',
        steps: ['Entidade', 'Irregularidade', 'Provas'],
        totalSteps: 3,
        color: '#FF8C00',
        icon: 'dollar-sign'
      },
      'domestic-violence': {
        title: 'Violência Doméstica',
        steps: ['Dados Gerais', 'Tipo de Violência', 'Urgência'],
        totalSteps: 3,
        color: '#8B5CF6',
        icon: 'shield-off'
      },
      'cyber-crime': {
        title: 'Crime Informático',
        steps: ['Tipo de Crime', 'Detalhes', 'Provas Digitais'],
        totalSteps: 3,
        color: '#059669',
        icon: 'smartphone'
      }
    };
    
    return configs[complaintType] || configs['missing-person'];
  };

  const config = getComplaintConfig();

  useEffect(() => {
    getCurrentLocation();
  }, []);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') return;

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
    setFormData((prev: any) => ({
      ...prev,
      [field]: value
    }));
  };

  const [dateFieldName, setDateFieldName] = useState('date');
  const [timeFieldName, setTimeFieldName] = useState('time');

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('pt-BR');
      handleInputChange(dateFieldName, formattedDate);
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
      handleInputChange(timeFieldName, formattedTime);
    }
  };

  const openDatePicker = (fieldName: string = 'date') => {
    setDateFieldName(fieldName);
    setShowDatePicker(true);
  };

  const openTimePicker = (fieldName: string = 'time') => {
    setTimeFieldName(fieldName);
    setShowTimePicker(true);
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
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
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

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    // Validação básica por step e tipo
    if (!validateCurrentStep()) return;
    
    if (currentStep < config.totalSteps) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleSubmit();
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateCurrentStep = () => {
    // Validações específicas por tipo e step
    const requiredFields = getRequiredFieldsForStep(complaintType, currentStep);
    
    for (const field of requiredFields) {
      const value = formData[field];
      
      if (!value || (typeof value === 'string' && value.trim() === '')) {
        Alert.alert('Campo obrigatório', `Por favor, preencha: ${getFieldLabel(field)}`);
        return false;
      }
    }
    
    return true;
  };

  const getRequiredFieldsForStep = (type: string, step: number) => {
    const requirements: any = {
      'missing-person': {
        1: ['fullName', 'age', 'gender'],
        2: ['lastSeenLocation', 'lastSeenDate'],
        3: isAnonymous ? [] : ['reporterContact']
      },
      'common-crime': {
        1: ['crimeType'],
        2: ['location', 'date'],
        3: ['description']
      },
      'corruption': {
        1: ['corruptionType', 'institution'],
        2: ['location', 'date'],
        3: ['description']
      },
      'domestic-violence': {
        1: ['victimName'],
        2: ['location'],
        3: ['description']
      },
      'cyber-crime': {
        1: ['cyberCrimeType'],
        2: ['date'],
        3: ['description']
      }
    };
    
    return requirements[type]?.[step] || [];
  };

  const getFieldLabel = (field: string) => {
    const labels: any = {
      fullName: 'Nome completo',
      age: 'Idade',
      gender: 'Gênero',
      lastSeenLocation: 'Local onde foi vista pela última vez',
      lastSeenDate: 'Data do desaparecimento',
      reporterContact: 'Telefone de contacto',
      crimeType: 'Tipo de crime',
      location: 'Local',
      date: 'Data',
      description: 'Descrição detalhada',
      corruptionType: 'Tipo de corrupção',
      institution: 'Instituição/Órgão envolvido',
      victimName: 'Nome da vítima',
      violenceType: 'Tipo de violência',
      cyberCrimeType: 'Tipo de crime cibernético',
      platform: 'Plataforma/Aplicativo'
    };
    
    return labels[field] || field;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);

    try {
      // Prepare complaint data for API
      const complaintData = {
        complaint_type: complaintType,
        is_anonymous: isAnonymous,
        incident_date: formData.date,
        incident_time: formData.time,
        location: formData.location,
        description: formData.description,
        latitude: null, // Add if you have coordinates
        longitude: null, // Add if you have coordinates
        
        // Reporter info (if not anonymous)
        reporter_name: !isAnonymous ? formData.reporterName : null,
        reporter_contact: !isAnonymous ? formData.reporterContact : null,
        reporter_email: !isAnonymous ? formData.reporterEmail : null,
        reporter_bi: null, // Add BI field if needed
        
        // Type-specific details
        type_details: getTypeSpecificDetails()
      };

      const response = await apiService.submitComplaint(complaintData);

      if (response.success) {
        // Upload images if any
        if (images.length > 0) {
          try {
            const imageFiles = images.map((uri, index) => ({
              uri,
              type: 'image/jpeg',
              name: `evidence_${index}.jpg`
            }));
            
            await apiService.uploadEvidence(response.data.id, imageFiles);
          } catch (uploadError) {
            console.warn('Failed to upload images:', uploadError);
            // Continue anyway, complaint is already submitted
          }
        }

        Alert.alert(
          'Denúncia Registrada!',
          `Sua denúncia foi registrada com sucesso.\n\nNúmero do protocolo: ${response.data.protocol_number}\n\nVocê receberá atualizações sobre o progresso.`,
          [
            {
              text: 'Acompanhar',
              onPress: () => router.push('/complaint/tracking')
            },
            {
              text: 'Voltar ao Início',
              onPress: () => router.push('/(tabs)')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Complaint submission error:', error);
      Alert.alert('Erro', 'Ocorreu um erro ao registrar a denúncia. Verifique sua conexão e tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper function to get type-specific details
  const getTypeSpecificDetails = () => {
    switch (complaintType) {
      case 'missing-person':
        return {
          full_name: formData.fullName,
          age: parseInt(formData.age) || null,
          gender: formData.gender?.toLowerCase(),
          physical_description: formData.physicalDescription,
          last_seen_location: formData.lastSeenLocation,
          last_seen_date: formData.lastSeenDate,
          last_seen_time: formData.lastSeenTime,
          clothing_description: formData.clothingDescription,
          last_seen_with: formData.lastSeenWith,
          medical_conditions: formData.medicalConditions,
          frequent_places: formData.frequentPlaces,
          relationship_to_reporter: formData.relationship
        };
      
      case 'common-crime':
        return {
          crime_type: formData.crimeType?.toLowerCase().replace(' ', '_'),
          other_crime_type: formData.otherCrimeType,
          brief_description: formData.briefDescription,
          people_involved: formData.peopleInvolved
        };
      
      case 'corruption':
        return {
          corruption_type: formData.corruptionType?.toLowerCase().replace(' ', '_'),
          institution: formData.institution,
          official_name: formData.officialName,
          estimated_amount: parseFloat(formData.amount) || null,
          currency: 'AOA',
          how_known: formData.howKnown
        };
      
      case 'domestic-violence':
        return {
          victim_name: formData.victimName,
          victim_age: parseInt(formData.victimAge) || null,
          victim_gender: formData.victimGender?.toLowerCase(),
          relationship_with_aggressor: formData.relationshipWithAggressor,
          violence_type: formData.violenceType?.toLowerCase(),
          frequency: formData.frequency,
          children_involved: formData.childrenInvolved === 'sim',
          needs_medical_help: formData.needsMedicalHelp === 'sim'
        };
      
      case 'cyber-crime':
        return {
          cyber_crime_type: formData.cyberCrimeType?.toLowerCase().replace(' ', '_'),
          platform: formData.platform,
          url: formData.url,
          contact_method: formData.contactMethod,
          suspect_info: formData.suspectInfo,
          estimated_loss: parseFloat(formData.amount) || null,
          currency: 'AOA'
        };
      
      default:
        return {};
    }
  };

  const renderMissingPersonStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Dados da Pessoa Desaparecida</Text>
            
            {/* Fotos */}
            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>
                Fotos da Pessoa <Text style={styles.required}>*</Text>
              </Text>
              <Text style={styles.sectionSubtitle}>Adicione fotos recentes e claras</Text>

              <View style={styles.photoButtonsRow}>
                <TouchableOpacity style={styles.photoActionButton} onPress={takePhoto}>
                  <Feather name="camera" size={20} color={config.color} />
                  <Text style={[styles.photoActionText, { color: config.color }]}>Tirar Foto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoActionButton} onPress={pickImage}>
                  <Feather name="image" size={20} color={config.color} />
                  <Text style={[styles.photoActionText, { color: config.color }]}>Da Galeria</Text>
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

            {/* Nome e dados básicos */}
            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
                <Text style={styles.label}>
                  Nome Completo <Text style={styles.required}>*</Text>
                </Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nome completo"
                  value={formData.fullName}
                  onChangeText={(value) => handleInputChange('fullName', value)}
                  placeholderTextColor="#7A8C7D"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Idade <Text style={styles.required}>*</Text></Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Idade"
                  value={formData.age}
                  onChangeText={(value) => handleInputChange('age', value)}
                  placeholderTextColor="#7A8C7D"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Gênero <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.quickOptionsGrid}>
                {['Masculino', 'Feminino'].map((gender, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quickOptionButton,
                      formData.gender === gender && [styles.quickOptionButtonActive, { backgroundColor: config.color }]
                    ]}
                    onPress={() => handleInputChange('gender', gender)}
                  >
                    <Text style={[
                      styles.quickOptionText,
                      { color: config.color },
                      formData.gender === gender && styles.quickOptionTextActive
                    ]}>{gender}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Características Físicas</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Altura, cabelo, estatura, sinais distintivos..."
                value={formData.physicalDescription}
                onChangeText={(value) => handleInputChange('physicalDescription', value)}
                placeholderTextColor="#7A8C7D"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Circunstâncias do Desaparecimento</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Local onde foi vista pela última vez <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.locationHeader}>
                <TouchableOpacity 
                  style={styles.autoButton}
                  onPress={getCurrentLocation}
                >
                  <Feather name="navigation" size={14} color={config.color} />
                  <Text style={[styles.autoButtonText, { color: config.color }]}>Usar localização atual</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Endereço, bairro, referências..."
                value={formData.lastSeenLocation}
                onChangeText={(value) => handleInputChange('lastSeenLocation', value)}
                placeholderTextColor="#7A8C7D"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Data <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => openDatePicker('lastSeenDate')}
                >
                  <Text style={formData.lastSeenDate ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.lastSeenDate || 'Selecionar data'}
                  </Text>
                  <Feather name="calendar" size={18} color={config.color} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Hora</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => openTimePicker('lastSeenTime')}
                >
                  <Text style={formData.lastSeenTime ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.lastSeenTime || 'Selecionar hora'}
                  </Text>
                  <Feather name="clock" size={18} color={config.color} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Roupas que vestia</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Descreva as roupas e acessórios..."
                value={formData.clothingDescription}
                onChangeText={(value) => handleInputChange('clothingDescription', value)}
                placeholderTextColor="#7A8C7D"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Estava acompanhada?</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Com quem estava, se conhece as pessoas..."
                value={formData.lastSeenWith}
                onChangeText={(value) => handleInputChange('lastSeenWith', value)}
                placeholderTextColor="#7A8C7D"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Dados de Contacto</Text>

            {!isAnonymous && (
              <View style={styles.formGroup}>
                <Text style={styles.sectionTitle}>Seus Dados</Text>
                
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 2, marginRight: 10 }]}>
                    <Text style={styles.label}>Seu Nome</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Seu nome completo"
                      value={formData.reporterName}
                      onChangeText={(value) => handleInputChange('reporterName', value)}
                      placeholderTextColor="#7A8C7D"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Parentesco</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Relação"
                      value={formData.relationship}
                      onChangeText={(value) => handleInputChange('relationship', value)}
                      placeholderTextColor="#7A8C7D"
                    />
                  </View>
                </View>

                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>
                      Telefone <Text style={styles.required}>*</Text>
                    </Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="(00) 00000-0000"
                      value={formData.reporterContact}
                      onChangeText={(value) => handleInputChange('reporterContact', value)}
                      placeholderTextColor="#7A8C7D"
                      keyboardType="phone-pad"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Email</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="seu@email.com"
                      value={formData.reporterEmail}
                      onChangeText={(value) => handleInputChange('reporterEmail', value)}
                      placeholderTextColor="#7A8C7D"
                      keyboardType="email-address"
                    />
                  </View>
                </View>
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>Informações Adicionais</Text>
              
              <View style={styles.inputGroup}>
                <Text style={styles.label}>Condições de saúde</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Doenças, medicamentos, alergias..."
                  value={formData.medicalConditions}
                  onChangeText={(value) => handleInputChange('medicalConditions', value)}
                  placeholderTextColor="#7A8C7D"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Locais que costuma frequentar</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Trabalho, escola, casa de amigos, hobbies..."
                  value={formData.frequentPlaces}
                  onChangeText={(value) => handleInputChange('frequentPlaces', value)}
                  placeholderTextColor="#7A8C7D"
                  multiline
                  numberOfLines={2}
                  textAlignVertical="top"
                />
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.label}>Observações extras</Text>
                <TextInput
                  style={[styles.textInput, styles.textArea]}
                  placeholder="Qualquer informação adicional que possa ajudar..."
                  value={formData.additionalInfo}
                  onChangeText={(value) => handleInputChange('additionalInfo', value)}
                  placeholderTextColor="#7A8C7D"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                />
              </View>
            </View>
          </View>
        );

      default:
        return null;
    }
  };

  const renderCommonCrimeStep = (step: number) => {
    const crimeTypes = [
      'Furto', 'Roubo', 'Agressão física', 'Homicídio', 'Sequestro',
      'Violação', 'Vandalismo', 'Tráfico', 'Burla', 'Outro'
    ];

    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Tipo de Crime</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Selecione o tipo de crime <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.quickOptionsGrid}>
                {crimeTypes.map((crime, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.quickOptionButton,
                      formData.crimeType === crime && [styles.quickOptionButtonActive, { backgroundColor: config.color }]
                    ]}
                    onPress={() => handleInputChange('crimeType', crime)}
                  >
                    <Text style={[
                      styles.quickOptionText,
                      { color: config.color },
                      formData.crimeType === crime && styles.quickOptionTextActive
                    ]}>{crime}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {formData.crimeType === 'Outro' && (
              <View style={styles.formGroup}>
                <Text style={styles.label}>Especifique o tipo de crime</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Descreva o tipo de crime"
                  value={formData.otherCrimeType}
                  onChangeText={(value) => handleInputChange('otherCrimeType', value)}
                  placeholderTextColor="#7A8C7D"
                />
              </View>
            )}

            <View style={styles.formGroup}>
              <Text style={styles.label}>Descrição resumida</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Conte brevemente o que aconteceu..."
                value={formData.briefDescription}
                onChangeText={(value) => handleInputChange('briefDescription', value)}
                placeholderTextColor="#7A8C7D"
                multiline
                numberOfLines={3}
                textAlignVertical="top"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Local e Data do Crime</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Local onde ocorreu <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.locationHeader}>
                <TouchableOpacity 
                  style={styles.autoButton}
                  onPress={getCurrentLocation}
                >
                  <Feather name="navigation" size={14} color={config.color} />
                  <Text style={[styles.autoButtonText, { color: config.color }]}>Usar localização atual</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Endereço, bairro, referências..."
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholderTextColor="#7A8C7D"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Data <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => openDatePicker('date')}
                >
                  <Text style={formData.date ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.date || 'Selecionar data'}
                  </Text>
                  <Feather name="calendar" size={18} color={config.color} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Hora aproximada</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => openTimePicker('time')}
                >
                  <Text style={formData.time ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.time || 'Selecionar hora'}
                  </Text>
                  <Feather name="clock" size={18} color={config.color} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Pessoas envolvidas</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Nomes, descrições, quantas pessoas..."
                value={formData.peopleInvolved}
                onChangeText={(value) => handleInputChange('peopleInvolved', value)}
                placeholderTextColor="#7A8C7D"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Detalhes e Provas</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Descrição detalhada <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Conte com detalhes o que aconteceu, como presenciou ou ficou sabendo..."
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholderTextColor="#7A8C7D"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>Provas (opcional)</Text>
              <Text style={styles.sectionSubtitle}>Adicione fotos, vídeos ou documentos</Text>

              <View style={styles.photoButtonsRow}>
                <TouchableOpacity style={styles.photoActionButton} onPress={takePhoto}>
                  <Feather name="camera" size={20} color={config.color} />
                  <Text style={[styles.photoActionText, { color: config.color }]}>Tirar Foto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoActionButton} onPress={pickImage}>
                  <Feather name="image" size={20} color={config.color} />
                  <Text style={[styles.photoActionText, { color: config.color }]}>Da Galeria</Text>
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

            {!isAnonymous && (
              <View style={styles.formGroup}>
                <Text style={styles.sectionTitle}>Seus Dados</Text>
                
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Seu Nome</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Seu nome completo"
                      value={formData.reporterName}
                      onChangeText={(value) => handleInputChange('reporterName', value)}
                      placeholderTextColor="#7A8C7D"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Telefone</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="(00) 00000-0000"
                      value={formData.reporterContact}
                      onChangeText={(value) => handleInputChange('reporterContact', value)}
                      placeholderTextColor="#7A8C7D"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  // Renderizar steps para Corrupção
  const renderCorruptionStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Dados do Ato de Corrupção</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Tipo de corrupção <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setShowCorruptionTypePicker(true)}
              >
                <Text style={formData.corruptionType ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                  {formData.corruptionType || 'Selecionar tipo'}
                </Text>
                <Feather name="chevron-down" size={18} color={config.color} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Instituição/Órgão envolvido <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nome da instituição, departamento..."
                value={formData.institution}
                onChangeText={(value) => handleInputChange('institution', value)}
                placeholderTextColor="#7A8C7D"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Pessoa(s) envolvida(s)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nome do funcionário, cargo..."
                value={formData.officialName}
                onChangeText={(value) => handleInputChange('officialName', value)}
                placeholderTextColor="#7A8C7D"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Valor aproximado (se aplicável)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Valor em kwanzas"
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                placeholderTextColor="#7A8C7D"
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Local e Data</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Local onde ocorreu <Text style={styles.required}>*</Text>
              </Text>
              <View style={styles.locationHeader}>
                <TouchableOpacity 
                  style={styles.autoButton}
                  onPress={getCurrentLocation}
                >
                  <Feather name="navigation" size={14} color={config.color} />
                  <Text style={[styles.autoButtonText, { color: config.color }]}>Usar localização atual</Text>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.textInput}
                placeholder="Endereço, bairro, referências..."
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholderTextColor="#7A8C7D"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Data <Text style={styles.required}>*</Text></Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => openDatePicker('date')}
                >
                  <Text style={formData.date ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.date || 'Selecionar data'}
                  </Text>
                  <Feather name="calendar" size={18} color={config.color} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Hora aproximada</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => openTimePicker('time')}
                >
                  <Text style={formData.time ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.time || 'Selecionar hora'}
                  </Text>
                  <Feather name="clock" size={18} color={config.color} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Como tomou conhecimento</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Presenciou, foi solicitado, soube por terceiros..."
                value={formData.howKnown}
                onChangeText={(value) => handleInputChange('howKnown', value)}
                placeholderTextColor="#7A8C7D"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Detalhes e Provas</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Descrição detalhada <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Descreva em detalhes o ato de corrupção..."
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholderTextColor="#7A8C7D"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>Provas (opcional)</Text>
              <Text style={styles.sectionSubtitle}>Adicione fotos, vídeos ou documentos</Text>

              <View style={styles.photoButtonsRow}>
                <TouchableOpacity style={styles.photoActionButton} onPress={takePhoto}>
                  <Feather name="camera" size={20} color={config.color} />
                  <Text style={[styles.photoActionText, { color: config.color }]}>Tirar Foto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoActionButton} onPress={pickImage}>
                  <Feather name="image" size={20} color={config.color} />
                  <Text style={[styles.photoActionText, { color: config.color }]}>Da Galeria</Text>
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

            {!isAnonymous && (
              <View style={styles.formGroup}>
                <Text style={styles.sectionTitle}>Seus Dados</Text>
                
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Seu Nome</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Seu nome completo"
                      value={formData.reporterName}
                      onChangeText={(value) => handleInputChange('reporterName', value)}
                      placeholderTextColor="#7A8C7D"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Telefone</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="(00) 00000-0000"
                      value={formData.reporterContact}
                      onChangeText={(value) => handleInputChange('reporterContact', value)}
                      placeholderTextColor="#7A8C7D"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  // Renderizar steps para Violência Doméstica
  const renderDomesticViolenceStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Dados da Vítima</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Nome da vítima <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Nome completo da vítima"
                value={formData.victimName}
                onChangeText={(value) => handleInputChange('victimName', value)}
                placeholderTextColor="#7A8C7D"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Idade</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Idade"
                  value={formData.victimAge}
                  onChangeText={(value) => handleInputChange('victimAge', value)}
                  placeholderTextColor="#7A8C7D"
                  keyboardType="numeric"
                />
              </View>
              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Género</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setShowGenderPicker(true)}
                >
                  <Text style={formData.victimGender ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.victimGender || 'Selecionar'}
                  </Text>
                  <Feather name="chevron-down" size={18} color={config.color} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Relação com o agressor</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Cônjuge, ex-cônjuge, namorado(a)..."
                value={formData.relationshipWithAggressor}
                onChangeText={(value) => handleInputChange('relationshipWithAggressor', value)}
                placeholderTextColor="#7A8C7D"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Tipo de violência</Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setShowViolenceTypePicker(true)}
              >
                <Text style={formData.violenceType ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                  {formData.violenceType || 'Selecionar tipo'}
                </Text>
                <Feather name="chevron-down" size={18} color={config.color} />
              </TouchableOpacity>
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Local e Frequência</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Local onde ocorreu <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={styles.textInput}
                placeholder="Casa da vítima, local público..."
                value={formData.location}
                onChangeText={(value) => handleInputChange('location', value)}
                placeholderTextColor="#7A8C7D"
              />
            </View>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Última ocorrência</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => openDatePicker('date')}
                >
                  <Text style={formData.date ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.date || 'Selecionar data'}
                  </Text>
                  <Feather name="calendar" size={18} color={config.color} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Frequência</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => setShowFrequencyPicker(true)}
                >
                  <Text style={formData.frequency ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.frequency || 'Selecionar'}
                  </Text>
                  <Feather name="chevron-down" size={18} color={config.color} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Há crianças envolvidas?</Text>
              <View style={styles.row}>
                <TouchableOpacity 
                  style={[styles.radioButton, formData.childrenInvolved === 'sim' && styles.radioButtonActive]}
                  onPress={() => handleInputChange('childrenInvolved', 'sim')}
                >
                  <Text style={[styles.radioText, formData.childrenInvolved === 'sim' && styles.radioTextActive]}>Sim</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.radioButton, formData.childrenInvolved === 'nao' && styles.radioButtonActive]}
                  onPress={() => handleInputChange('childrenInvolved', 'nao')}
                >
                  <Text style={[styles.radioText, formData.childrenInvolved === 'nao' && styles.radioTextActive]}>Não</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>A vítima precisa de ajuda médica imediata?</Text>
              <View style={styles.row}>
                <TouchableOpacity 
                  style={[styles.radioButton, formData.needsMedicalHelp === 'sim' && styles.radioButtonActive]}
                  onPress={() => handleInputChange('needsMedicalHelp', 'sim')}
                >
                  <Text style={[styles.radioText, formData.needsMedicalHelp === 'sim' && styles.radioTextActive]}>Sim</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.radioButton, formData.needsMedicalHelp === 'nao' && styles.radioButtonActive]}
                  onPress={() => handleInputChange('needsMedicalHelp', 'nao')}
                >
                  <Text style={[styles.radioText, formData.needsMedicalHelp === 'nao' && styles.radioTextActive]}>Não</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Detalhes e Provas</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Descrição dos factos <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Descreva o que aconteceu, lesões, ameaças..."
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholderTextColor="#7A8C7D"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>Provas (opcional)</Text>
              <Text style={styles.sectionSubtitle}>Fotos de lesões, documentos médicos</Text>

              <View style={styles.photoButtonsRow}>
                <TouchableOpacity style={styles.photoActionButton} onPress={takePhoto}>
                  <Feather name="camera" size={20} color={config.color} />
                  <Text style={[styles.photoActionText, { color: config.color }]}>Tirar Foto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoActionButton} onPress={pickImage}>
                  <Feather name="image" size={20} color={config.color} />
                  <Text style={[styles.photoActionText, { color: config.color }]}>Da Galeria</Text>
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

            {!isAnonymous && (
              <View style={styles.formGroup}>
                <Text style={styles.sectionTitle}>Seus Dados</Text>
                
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Seu Nome</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Seu nome completo"
                      value={formData.reporterName}
                      onChangeText={(value) => handleInputChange('reporterName', value)}
                      placeholderTextColor="#7A8C7D"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Telefone</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="(00) 00000-0000"
                      value={formData.reporterContact}
                      onChangeText={(value) => handleInputChange('reporterContact', value)}
                      placeholderTextColor="#7A8C7D"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  // Renderizar steps para Crimes Cibernéticos
  const renderCyberCrimeStep = (step: number) => {
    switch (step) {
      case 1:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Tipo de Crime Cibernético</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Tipo de crime <Text style={styles.required}>*</Text>
              </Text>
              <TouchableOpacity 
                style={styles.pickerButton}
                onPress={() => setShowCyberCrimeTypePicker(true)}
              >
                <Text style={formData.cyberCrimeType ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                  {formData.cyberCrimeType || 'Selecionar tipo'}
                </Text>
                <Feather name="chevron-down" size={18} color={config.color} />
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Plataforma/Aplicativo</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Facebook, WhatsApp, Email, Website..."
                value={formData.platform}
                onChangeText={(value) => handleInputChange('platform', value)}
                placeholderTextColor="#7A8C7D"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>URL/Link (se aplicável)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="https://..."
                value={formData.url}
                onChangeText={(value) => handleInputChange('url', value)}
                placeholderTextColor="#7A8C7D"
                keyboardType="url"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Valor perdido (se aplicável)</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Valor em meticais"
                value={formData.amount}
                onChangeText={(value) => handleInputChange('amount', value)}
                placeholderTextColor="#7A8C7D"
                keyboardType="numeric"
              />
            </View>
          </View>
        );

      case 2:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Como Ocorreu</Text>

            <View style={styles.row}>
              <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                <Text style={styles.label}>Data do crime</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => openDatePicker('date')}
                >
                  <Text style={formData.date ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.date || 'Selecionar data'}
                  </Text>
                  <Feather name="calendar" size={18} color={config.color} />
                </TouchableOpacity>
              </View>

              <View style={[styles.inputGroup, { flex: 1 }]}>
                <Text style={styles.label}>Hora aproximada</Text>
                <TouchableOpacity 
                  style={styles.pickerButton}
                  onPress={() => openTimePicker('time')}
                >
                  <Text style={formData.time ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
                    {formData.time || 'Selecionar hora'}
                  </Text>
                  <Feather name="clock" size={18} color={config.color} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Como foi contactado pelo criminoso?</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Mensagem, chamada, email, anúncio..."
                value={formData.contactMethod}
                onChangeText={(value) => handleInputChange('contactMethod', value)}
                placeholderTextColor="#7A8C7D"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Informações do suspeito (se conhecer)</Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Nome, perfil, número de telefone, conta bancária..."
                value={formData.suspectInfo}
                onChangeText={(value) => handleInputChange('suspectInfo', value)}
                placeholderTextColor="#7A8C7D"
                multiline
                numberOfLines={2}
                textAlignVertical="top"
              />
            </View>
          </View>
        );

      case 3:
        return (
          <View style={styles.stepContainer}>
            <Text style={styles.stepTitle}>Detalhes e Provas</Text>

            <View style={styles.formGroup}>
              <Text style={styles.label}>
                Descrição detalhada <Text style={styles.required}>*</Text>
              </Text>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                placeholder="Conte passo a passo como foi enganado, o que aconteceu..."
                value={formData.description}
                onChangeText={(value) => handleInputChange('description', value)}
                placeholderTextColor="#7A8C7D"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.sectionTitle}>Provas (opcional)</Text>
              <Text style={styles.sectionSubtitle}>Screenshots, emails, mensagens</Text>

              <View style={styles.photoButtonsRow}>
                <TouchableOpacity style={styles.photoActionButton} onPress={takePhoto}>
                  <Feather name="camera" size={20} color={config.color} />
                  <Text style={[styles.photoActionText, { color: config.color }]}>Tirar Foto</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.photoActionButton} onPress={pickImage}>
                  <Feather name="image" size={20} color={config.color} />
                  <Text style={[styles.photoActionText, { color: config.color }]}>Da Galeria</Text>
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

            {!isAnonymous && (
              <View style={styles.formGroup}>
                <Text style={styles.sectionTitle}>Seus Dados</Text>
                
                <View style={styles.row}>
                  <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
                    <Text style={styles.label}>Seu Nome</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="Seu nome completo"
                      value={formData.reporterName}
                      onChangeText={(value) => handleInputChange('reporterName', value)}
                      placeholderTextColor="#7A8C7D"
                    />
                  </View>
                  <View style={[styles.inputGroup, { flex: 1 }]}>
                    <Text style={styles.label}>Telefone</Text>
                    <TextInput
                      style={styles.textInput}
                      placeholder="(00) 00000-0000"
                      value={formData.reporterContact}
                      onChangeText={(value) => handleInputChange('reporterContact', value)}
                      placeholderTextColor="#7A8C7D"
                      keyboardType="phone-pad"
                    />
                  </View>
                </View>
              </View>
            )}
          </View>
        );

      default:
        return null;
    }
  };

  // Função principal para renderizar steps baseados no tipo
  const renderStep = () => {
    switch (complaintType) {
      case 'missing-person':
        return renderMissingPersonStep(currentStep);
      case 'common-crime':
        return renderCommonCrimeStep(currentStep);
      case 'corruption':
        return renderCorruptionStep(currentStep);
      case 'domestic-violence':
        return renderDomesticViolenceStep(currentStep);
      case 'cyber-crime':
        return renderCyberCrimeStep(currentStep);
      default:
        return renderMissingPersonStep(currentStep);
    }
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
            <View style={styles.headerCenter}>
              <Text style={styles.headerTitle}>{config.title}</Text>
              {isAnonymous && (
                <Text style={styles.headerSubtitle}>Denúncia Anónima</Text>
              )}
            </View>
            <View style={{ width: 24 }} />
          </View>

          {/* Progress Steps */}
          <View style={styles.progressContainer}>
            {Array.from({ length: config.totalSteps }, (_, i) => i + 1).map((step) => (
              <View key={step} style={styles.progressStep}>
                <View style={[
                  styles.progressCircle,
                  currentStep >= step && [styles.progressCircleActive, { backgroundColor: config.color }]
                ]}>
                  <Text style={[
                    styles.progressText,
                    currentStep >= step && styles.progressTextActive
                  ]}>{step}</Text>
                </View>
                <Text style={styles.progressLabel}>
                  {config.steps[step - 1]}
                </Text>
              </View>
            ))}
          </View>

          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{
              paddingBottom: insets.bottom + 100
            }}
          >
            {renderStep()}
          </ScrollView>

          {/* Navigation Buttons */}
          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                <Feather name="arrow-left" size={18} color="#1E88E5" />
                <Text style={styles.prevButtonText}>Voltar</Text>
              </TouchableOpacity>
            )}
            
            <TouchableOpacity 
              style={[styles.nextButton, { backgroundColor: config.color }]} 
              onPress={nextStep}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Feather name="loader" size={18} color="#FFF" />
                  <Text style={styles.nextButtonText}>Enviando...</Text>
                </>
              ) : (
                <>
                  <Text style={styles.nextButtonText}>
                    {currentStep === config.totalSteps ? 'Enviar Denúncia' : 'Continuar'}
                  </Text>
                  <Feather name="arrow-right" size={18} color="#FFF" />
                </>
              )}
            </TouchableOpacity>
          </View>

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

          {/* Modals for Pickers */}
          <Modal
            visible={showCorruptionTypePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCorruptionTypePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Tipo de Corrupção</Text>
                {['Suborno', 'Extorsão', 'Nepotismo', 'Abuso de poder', 'Fraude', 'Outro'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.modalOption}
                    onPress={() => {
                      handleInputChange('corruptionType', type);
                      setShowCorruptionTypePicker(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{type}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowCorruptionTypePicker(false)}
                >
                  <Text style={styles.modalCloseText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showGenderPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowGenderPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Género</Text>
                {['Masculino', 'Feminino', 'Prefiro não informar'].map((gender) => (
                  <TouchableOpacity
                    key={gender}
                    style={styles.modalOption}
                    onPress={() => {
                      handleInputChange('victimGender', gender);
                      setShowGenderPicker(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{gender}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowGenderPicker(false)}
                >
                  <Text style={styles.modalCloseText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showViolenceTypePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowViolenceTypePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Tipo de Violência</Text>
                {['Física', 'Psicológica', 'Sexual', 'Moral', 'Patrimonial', 'Múltiplas'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.modalOption}
                    onPress={() => {
                      handleInputChange('violenceType', type);
                      setShowViolenceTypePicker(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{type}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowViolenceTypePicker(false)}
                >
                  <Text style={styles.modalCloseText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showFrequencyPicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowFrequencyPicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Frequência</Text>
                {['Primeira vez', 'Poucas vezes', 'Frequentemente', 'Diariamente'].map((freq) => (
                  <TouchableOpacity
                    key={freq}
                    style={styles.modalOption}
                    onPress={() => {
                      handleInputChange('frequency', freq);
                      setShowFrequencyPicker(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{freq}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowFrequencyPicker(false)}
                >
                  <Text style={styles.modalCloseText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            visible={showCyberCrimeTypePicker}
            transparent={true}
            animationType="slide"
            onRequestClose={() => setShowCyberCrimeTypePicker(false)}
          >
            <View style={styles.modalOverlay}>
              <View style={styles.modalContent}>
                <Text style={styles.modalTitle}>Tipo de Crime Cibernético</Text>
                {['Burla/Golpe online', 'Roubo de identidade', 'Phishing', 'Chantagem', 'Cyberbullying', 'Outro'].map((type) => (
                  <TouchableOpacity
                    key={type}
                    style={styles.modalOption}
                    onPress={() => {
                      handleInputChange('cyberCrimeType', type);
                      setShowCyberCrimeTypePicker(false);
                    }}
                  >
                    <Text style={styles.modalOptionText}>{type}</Text>
                  </TouchableOpacity>
                ))}
                <TouchableOpacity
                  style={styles.modalCloseButton}
                  onPress={() => setShowCyberCrimeTypePicker(false)}
                >
                  <Text style={styles.modalCloseText}>Cancelar</Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
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
    paddingBottom: 10,
  },
  backButton: {
    padding: 8,
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0F0D',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#7A8C7D',
    textAlign: 'center',
    marginTop: 2,
  },
  // Progress Steps
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  progressStep: {
    alignItems: 'center',
    flex: 1,
  },
  progressCircle: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#E5E7EB',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 4,
  },
  progressCircleActive: {
    backgroundColor: '#1E88E5',
  },
  progressText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#9CA3AF',
  },
  progressTextActive: {
    color: '#FFFFFF',
  },
  progressLabel: {
    fontSize: 10,
    color: '#7A8C7D',
    textAlign: 'center',
  },
  // Steps
  stepContainer: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  stepTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 20,
  },
  formGroup: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0F0D',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: '#7A8C7D',
    marginBottom: 12,
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
  // Quick Options
  quickOptionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  quickOptionButton: {
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.3)',
  },
  quickOptionButtonActive: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  quickOptionText: {
    fontSize: 12,
    color: '#1E88E5',
    textAlign: 'center',
  },
  quickOptionTextActive: {
    color: '#FFFFFF',
  },
  // Location
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginBottom: 8,
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
  // Date/Time
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
  // Navigation
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 136, 229, 0.1)',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  prevButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    marginRight: 12,
    gap: 8,
  },
  prevButtonText: {
    fontSize: 16,
    color: '#1E88E5',
    fontWeight: '600',
  },
  nextButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1E88E5',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
  },
  nextButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  // Radio Buttons
  radioButton: {
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
    marginRight: 12,
    minWidth: 80,
    alignItems: 'center',
  },
  radioButtonActive: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  radioText: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '500',
  },
  radioTextActive: {
    color: '#FFFFFF',
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 20,
    textAlign: 'center',
  },
  modalOption: {
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(30, 136, 229, 0.1)',
  },
  modalOptionText: {
    fontSize: 16,
    color: '#0A0F0D',
  },
  modalCloseButton: {
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginTop: 20,
    alignItems: 'center',
  },
  modalCloseText: {
    fontSize: 16,
    color: '#1E88E5',
    fontWeight: '600',
  },
});
