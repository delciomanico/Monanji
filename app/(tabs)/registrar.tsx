import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useState, useEffect } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View, Alert, Image, Switch } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function RegisterMissingScreen() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    // Informações da Pessoa
    fullName: '',
    nickname: '',
    age: '',
    gender: '',
    height: '',
    weight: '',
    skinTone: '',
    eyeColor: '',
    hairColor: '',
    hairType: '',
    distinctiveMarks: '',
    
    // Informações do Desaparecimento
    lastSeenLocation: '',
    lastSeenDate: '',
    lastSeenTime: '',
    clothingDescription: '',
    lastSeenWith: '',
    
    // Informações do Denunciante
    reporterName: '',
    reporterRelationship: '',
    reporterContact: '',
    reporterEmail: '',
    
    // Informações Adicionais
    medicalConditions: '',
    medications: '',
    specialNeeds: '',
    habits: '',
    frequentLocations: ''
  });

  const [images, setImages] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentLocation, setCurrentLocation] = useState<string>('');
  const [isUrgent, setIsUrgent] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);

  // Opções pré-definidas para seleção rápida
  const genderOptions = ['Masculino', 'Feminino'];
  const ageGroups = ['Criança (0-12)', 'Adolescente (13-17)', 'Jovem (18-25)', 'Adulto (26-59)', 'Idoso (60+)'];
  const skinTones = ['Muito clara', 'Clara', 'Morena clara', 'Morena', 'Morena escura', 'Negra'];
  const eyeColors = ['Castanho', 'Preto', 'Azul', 'Verde', 'Mel', 'Cinza'];
  const hairColors = ['Preto', 'Castanho', 'Loiro', 'Ruivo', 'Grisalho', 'Colorido'];
  const hairTypes = ['Liso', 'Ondulado', 'Cacheado', 'Crespo', 'Raspado', 'Careca'];
  const relationships = ['Pai/Mãe', 'Filho(a)', 'Irmão(ã)', 'Cônjuge', 'Amigo(a)', 'Vizinho(a)', 'Outro'];

  // Roupas pré-definidas
  const clothingItems = [
    'Camiseta branca', 'Camisa azul', 'Blusa vermelha', 'Calça jeans',
    'Short preto', 'Vestido florido', 'Saia', 'Casaco', 'Moletom',
    'Uniforme escolar', 'Roupas sociais', 'Roupas esportivas',
    'Boné/chapéu', 'Óculos escuros', 'Tênis', 'Sandálias'
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
        handleInputChange('lastSeenLocation', locationText);
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

  const handleQuickSelect = (field: string, value: string) => {
    handleInputChange(field, value);
  };

  const addClothingItem = (item: string) => {
    const current = formData.clothingDescription || '';
    const newValue = current ? `${current}, ${item}` : item;
    handleInputChange('clothingDescription', newValue);
  };

  const addFrequentLocation = (location: string) => {
    const current = formData.frequentLocations || '';
    const newValue = current ? `${current}, ${location}` : location;
    handleInputChange('frequentLocations', newValue);
  };

  const onDateChange = (event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toLocaleDateString('pt-BR');
      const formattedTime = date.toLocaleTimeString('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      handleInputChange('lastSeenDate', formattedDate);
      handleInputChange('lastSeenTime', formattedTime);
    }
  };

  const useCurrentDateTime = () => {
    const now = new Date();
    setSelectedDate(now);
    handleInputChange('lastSeenDate', now.toLocaleDateString('pt-BR'));
    handleInputChange('lastSeenTime', now.toLocaleTimeString('pt-BR', { 
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
      setImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const nextStep = () => {
    if (currentStep === 1 && (!formData.fullName || !formData.age || !formData.gender)) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha pelo menos nome, idade e gênero.');
      return;
    }
    if (currentStep === 2 && (!formData.lastSeenLocation || !formData.lastSeenDate)) {
      Alert.alert('Campos obrigatórios', 'Por favor, informe onde e quando a pessoa foi vista pela última vez.');
      return;
    }
    setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    if (!formData.reporterName || !formData.reporterContact) {
      Alert.alert('Campos obrigatórios', 'Por favor, preencha seus dados de contato.');
      return;
    }

    if (images.length === 0) {
      Alert.alert('Foto necessária', 'Por favor, adicione pelo menos uma foto da pessoa desaparecida.');
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Denúncia Registrada!',
        `Sua denúncia foi registrada com sucesso. ${isUrgent ? 'Caso URGENTE - nossa equipe entrará em contato imediatamente.' : 'Nossa equipe analisará as informações e entrará em contato.'}`,
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Erro', 'Ocorreu um erro ao registrar a denúncia. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep1 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Informações da Pessoa</Text>
      
      {/* Fotos */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionTitle}>
          Fotos da Pessoa <Text style={styles.required}>*</Text>
        </Text>
        <Text style={styles.sectionSubtitle}>Adicione fotos recentes e claras</Text>
        
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

      {/* Nome e Apelido */}
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
          <Text style={styles.label}>Apelido</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Como chamam"
            value={formData.nickname}
            onChangeText={(value) => handleInputChange('nickname', value)}
            placeholderTextColor="#7A8C7D"
          />
        </View>
      </View>

      {/* Idade e Gênero */}
      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Idade <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.quickOptionsGrid}>
          {ageGroups.map((age, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickOptionButton,
                formData.age === age && styles.quickOptionButtonActive
              ]}
              onPress={() => handleQuickSelect('age', age)}
            >
              <Text style={[
                styles.quickOptionText,
                formData.age === age && styles.quickOptionTextActive
              ]}>{age}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="Idade exata (opcional)"
          value={formData.age}
          onChangeText={(value) => handleInputChange('age', value)}
          placeholderTextColor="#7A8C7D"
          keyboardType="numeric"
        />
      </View>

      <View style={styles.formGroup}>
        <Text style={styles.label}>
          Gênero <Text style={styles.required}>*</Text>
        </Text>
        <View style={styles.quickOptionsGrid}>
          {genderOptions.map((gender, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.quickOptionButton,
                formData.gender === gender && styles.quickOptionButtonActive
              ]}
              onPress={() => handleQuickSelect('gender', gender)}
            >
              <Text style={[
                styles.quickOptionText,
                formData.gender === gender && styles.quickOptionTextActive
              ]}>{gender}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Características Físicas */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionTitle}>Características Físicas</Text>
        
        <View style={styles.quickSection}>
          <Text style={styles.quickSectionTitle}>Tom de Pele</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsContainer}>
              {skinTones.map((tone, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chip,
                    formData.skinTone === tone && styles.chipActive
                  ]}
                  onPress={() => handleQuickSelect('skinTone', tone)}
                >
                  <Text style={[
                    styles.chipText,
                    formData.skinTone === tone && styles.chipTextActive
                  ]}>{tone}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
            <Text style={styles.label}>Altura (cm)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 175"
              value={formData.height}
              onChangeText={(value) => handleInputChange('height', value)}
              placeholderTextColor="#7A8C7D"
              keyboardType="numeric"
            />
          </View>
          <View style={[styles.inputGroup, { flex: 1 }]}>
            <Text style={styles.label}>Peso (kg)</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Ex: 70"
              value={formData.weight}
              onChangeText={(value) => handleInputChange('weight', value)}
              placeholderTextColor="#7A8C7D"
              keyboardType="numeric"
            />
          </View>
        </View>

        <View style={styles.quickSection}>
          <Text style={styles.quickSectionTitle}>Cor dos Olhos</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsContainer}>
              {eyeColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chip,
                    formData.eyeColor === color && styles.chipActive
                  ]}
                  onPress={() => handleQuickSelect('eyeColor', color)}
                >
                  <Text style={[
                    styles.chipText,
                    formData.eyeColor === color && styles.chipTextActive
                  ]}>{color}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.quickSection}>
          <Text style={styles.quickSectionTitle}>Cabelo - Cor</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsContainer}>
              {hairColors.map((color, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chip,
                    formData.hairColor === color && styles.chipActive
                  ]}
                  onPress={() => handleQuickSelect('hairColor', color)}
                >
                  <Text style={[
                    styles.chipText,
                    formData.hairColor === color && styles.chipTextActive
                  ]}>{color}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.quickSection}>
          <Text style={styles.quickSectionTitle}>Cabelo - Tipo</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            <View style={styles.chipsContainer}>
              {hairTypes.map((type, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.chip,
                    formData.hairType === type && styles.chipActive
                  ]}
                  onPress={() => handleQuickSelect('hairType', type)}
                >
                  <Text style={[
                    styles.chipText,
                    formData.hairType === type && styles.chipTextActive
                  ]}>{type}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Marcas Distinctivas</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Cicatrizes, tatuagens, piercings, etc."
            value={formData.distinctiveMarks}
            onChangeText={(value) => handleInputChange('distinctiveMarks', value)}
            placeholderTextColor="#7A8C7D"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
          />
        </View>
      </View>
    </View>
  );

  const renderStep2 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Última Localização</Text>

      {/* Urgência */}
      <View style={styles.urgencySection}>
        <View style={styles.urgencyHeader}>
          <Feather name="alert-triangle" size={20} color="#AF2E24" />
          <Text style={styles.urgencyTitle}>Caso Urgente</Text>
          <Switch
            value={isUrgent}
            onValueChange={setIsUrgent}
            trackColor={{ false: '#767577', true: '#AF2E24' }}
            thumbColor={isUrgent ? '#FFF' : '#f4f3f4'}
          />
        </View>
        <Text style={styles.urgencyDescription}>
          {isUrgent 
            ? 'Caso marcado como URGENTE - Prioridade máxima para a equipe'
            : 'Marque se houver risco iminente à vida (criança, idoso, saúde)'
          }
        </Text>
      </View>

      {/* Localização */}
      <View style={styles.formGroup}>
        <View style={styles.locationHeader}>
          <Text style={styles.label}>
            Onde foi visto pela última vez? <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity 
            style={styles.autoButton}
            onPress={getCurrentLocation}
          >
            <Feather name="navigation" size={14} color="#1E88E5" />
            <Text style={styles.autoButtonText}>Minha localização</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          style={styles.textInput}
          placeholder="Endereço, ponto de referência..."
          value={formData.lastSeenLocation}
          onChangeText={(value) => handleInputChange('lastSeenLocation', value)}
          placeholderTextColor="#7A8C7D"
        />
        {currentLocation && (
          <Text style={styles.locationHint}>
            📍 Localização atual: {currentLocation}
          </Text>
        )}
      </View>

      {/* Data e Hora */}
      <View style={styles.formGroup}>
        <View style={styles.dateTimeHeader}>
          <Text style={styles.label}>
            Quando foi visto pela última vez? <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity onPress={useCurrentDateTime}>
            <Text style={styles.nowButton}>Agora</Text>
          </TouchableOpacity>
        </View>
        
        <TouchableOpacity 
          style={styles.pickerButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={formData.lastSeenDate ? styles.pickerButtonText : styles.pickerButtonPlaceholder}>
            {formData.lastSeenDate || 'Selecionar data e hora'}
          </Text>
          <Feather name="calendar" size={18} color="#1E88E5" />
        </TouchableOpacity>
        
        {(formData.lastSeenDate || formData.lastSeenTime) && (
          <Text style={styles.selectedDateTime}>
            📅 {formData.lastSeenDate} 🕐 {formData.lastSeenTime}
          </Text>
        )}
      </View>

      {/* Roupas */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionTitle}>Roupas que usava</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
          <View style={styles.chipsContainer}>
            {clothingItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={styles.chip}
                onPress={() => addClothingItem(item)}
              >
                <Text style={styles.chipText}>+ {item}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Descreva as roupas em detalhes..."
          value={formData.clothingDescription}
          onChangeText={(value) => handleInputChange('clothingDescription', value)}
          placeholderTextColor="#7A8C7D"
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>

      {/* Acompanhantes */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Estava com alguém?</Text>
        <TextInput
          style={styles.textInput}
          placeholder="Descreva companhias..."
          value={formData.lastSeenWith}
          onChangeText={(value) => handleInputChange('lastSeenWith', value)}
          placeholderTextColor="#7A8C7D"
        />
      </View>

      {/* Locais Frequentes */}
      <View style={styles.inputGroup}>
        <Text style={styles.label}>Locais que frequenta</Text>
        <TextInput
          style={[styles.textInput, styles.textArea]}
          placeholder="Escola, trabalho, praças, etc."
          value={formData.frequentLocations}
          onChangeText={(value) => handleInputChange('frequentLocations', value)}
          placeholderTextColor="#7A8C7D"
          multiline
          numberOfLines={2}
          textAlignVertical="top"
        />
      </View>
    </View>
  );

  const renderStep3 = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Seus Dados e Informações</Text>

      {/* Dados do Denunciante */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionTitle}>Seus Dados</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Seu Nome <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={styles.textInput}
            placeholder="Nome completo"
            value={formData.reporterName}
            onChangeText={(value) => handleInputChange('reporterName', value)}
            placeholderTextColor="#7A8C7D"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>
            Parentesco <Text style={styles.required}>*</Text>
          </Text>
          <View style={styles.quickOptionsGrid}>
            {relationships.map((rel, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.quickOptionButton,
                  formData.reporterRelationship === rel && styles.quickOptionButtonActive
                ]}
                onPress={() => handleQuickSelect('reporterRelationship', rel)}
              >
                <Text style={[
                  styles.quickOptionText,
                  formData.reporterRelationship === rel && styles.quickOptionTextActive
                ]}>{rel}</Text>
              </TouchableOpacity>
            ))}
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

      {/* Informações de Saúde */}
      <View style={styles.formGroup}>
        <Text style={styles.sectionTitle}>Informações de Saúde</Text>
        
        <View style={styles.inputGroup}>
          <Text style={styles.label}>Condições Médicas</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Doenças, alergias, condições especiais..."
            value={formData.medicalConditions}
            onChangeText={(value) => handleInputChange('medicalConditions', value)}
            placeholderTextColor="#7A8C7D"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Medicações</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Medicamentos de uso regular"
            value={formData.medications}
            onChangeText={(value) => handleInputChange('medications', value)}
            placeholderTextColor="#7A8C7D"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Necessidades Especiais</Text>
          <TextInput
            style={styles.textInput}
            placeholder="Mobilidade, comunicação, etc."
            value={formData.specialNeeds}
            onChangeText={(value) => handleInputChange('specialNeeds', value)}
            placeholderTextColor="#7A8C7D"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Hábitos e Rotinas</Text>
          <TextInput
            style={[styles.textInput, styles.textArea]}
            placeholder="Rotinas, hobbies, lugares que gosta..."
            value={formData.habits}
            onChangeText={(value) => handleInputChange('habits', value)}
            placeholderTextColor="#7A8C7D"
            multiline
            numberOfLines={2}
            textAlignVertical="top"
          />
        </View>
      </View>

      {/* Botão Final */}
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
              <Text style={styles.submitButtonText}>REGISTRANDO...</Text>
            </>
          ) : (
            <>
              <Feather name="user-plus" size={20} color="#FFF" />
              <Text style={styles.submitButtonText}>REGISTRAR DESAPARECIMENTO</Text>
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <Text style={styles.finalNote}>
        ✅ Sua denúncia será analisada e publicada em até 2 horas
        {'\n'}✅ Casos urgentes recebem atenção imediata
        {'\n'}✅ Você receberá atualizações por SMS
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
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
          <Text style={styles.detailTitle}>Registrar Desaparecimento</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Progress Steps */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((step) => (
            <View key={step} style={styles.progressStep}>
              <View style={[
                styles.progressCircle,
                currentStep >= step && styles.progressCircleActive
              ]}>
                <Text style={[
                  styles.progressText,
                  currentStep >= step && styles.progressTextActive
                ]}>{step}</Text>
              </View>
              <Text style={styles.progressLabel}>
                {step === 1 ? 'Pessoa' : step === 2 ? 'Localização' : 'Contato'}
              </Text>
            </View>
          ))}
        </View>

        <ScrollView showsVerticalScrollIndicator={false}>
          {currentStep === 1 && renderStep1()}
          {currentStep === 2 && renderStep2()}
          {currentStep === 3 && renderStep3()}
        </ScrollView>

        {/* Navigation Buttons */}
        {currentStep < 3 && (
          <View style={styles.navigationButtons}>
            {currentStep > 1 && (
              <TouchableOpacity style={styles.prevButton} onPress={prevStep}>
                <Feather name="arrow-left" size={18} color="#1E88E5" />
                <Text style={styles.prevButtonText}>Voltar</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity style={styles.nextButton} onPress={nextStep}>
              <Text style={styles.nextButtonText}>Continuar</Text>
              <Feather name="arrow-right" size={18} color="#FFF" />
            </TouchableOpacity>
          </View>
        )}

        {/* Date Picker */}
        {showDatePicker && (
          <DateTimePicker
            value={selectedDate}
            mode="datetime"
            display="default"
            onChange={onDateChange}
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
    fontSize: 12,
    color: '#7A8C7D',
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
  // Urgência
  urgencySection: {
    backgroundColor: 'rgba(175, 46, 36, 0.05)',
    padding: 16,
    borderRadius: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#AF2E24',
    marginBottom: 20,
  },
  urgencyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  urgencyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#AF2E24',
    marginLeft: 8,
    flex: 1,
  },
  urgencyDescription: {
    fontSize: 12,
    color: '#7A8C7D',
    lineHeight: 16,
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
  // Date/Time
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
  selectedDateTime: {
    fontSize: 14,
    color: '#1E88E5',
    marginTop: 8,
    fontWeight: '500',
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
  // Chips
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
  chipActive: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  chipText: {
    fontSize: 12,
    color: '#1E88E5',
    fontWeight: '500',
  },
  chipTextActive: {
    color: '#FFFFFF',
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
  // Navegação
  navigationButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: 'rgba(30, 136, 229, 0.1)',
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
  finalNote: {
    fontSize: 12,
    color: '#7A8C7D',
    lineHeight: 18,
    textAlign: 'center',
  },
});