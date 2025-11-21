import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { Image, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import apiService from '../../services/ApiService';

export default function SearchScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState({
    gender: '',
    status: '',
    province: ''
  });
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const performSearch = async () => {
    setIsLoading(true);
    try {
      const params: any = {};
      
      if (searchQuery.trim()) {
        params.q = searchQuery.trim();
      }
      
      if (selectedFilters.gender) {
        params.gender = selectedFilters.gender.toLowerCase();
      }
      
      if (selectedFilters.status) {
        params.status = selectedFilters.status.toLowerCase();
      }
      
      if (selectedFilters.province) {
        params.province = selectedFilters.province;
      }

      const response = await apiService.searchMissingPersons(params);
      
      if (response.success) {
        setSearchResults(response.data.persons || []);
      } else {
        // Fallback to mock data if API fails
        setSearchResults(mockSearchResults);
      }
    } catch (error) {
      console.error('Search error:', error);
      // Fallback to mock data
      setSearchResults(mockSearchResults);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial results on mount
  useEffect(() => {
    performSearch();
  }, []);

  const mockSearchResults = [
    {
      id: 1,
      name: 'Kiala Manuel',
      age: 25,
      location: 'Luanda, Maianga',
      lastSeen: '15/12/2023',
      status: 'missing',
      image: 'https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?w=150&h=150&fit=crop&crop=face',
      description: 'Estatura média, cabelo black power, usa óculos'
    },
    {
      id: 2,
      name: 'Ndola Costa',
      age: 8,
      location: 'Huambo, Centro',
      lastSeen: '10/12/2023',
      status: 'missing',
      image: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=150&h=150&fit=crop&crop=face',
      description: 'Criança, vestia uniforme escolar azul'
    },
    {
      id: 3,
      name: 'João Fernandes',
      age: 45,
      location: 'Benguela',
      lastSeen: '05/12/2023',
      status: 'found',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
      description: 'Encontrado em bom estado de saúde'
    }
  ];

  const filters = {
    gender: [
      { label: 'Masculino', value: 'male' },
      { label: 'Feminino', value: 'female' }
    ],
    status: [
      { label: 'Desaparecido', value: 'missing' },
      { label: 'Encontrado', value: 'found' }
    ],
    province: [
      { label: 'Luanda', value: 'luanda' },
      { label: 'Huambo', value: 'huambo' },
      { label: 'Benguela', value: 'benguela' },
      { label: 'Huíla', value: 'huila' }
    ]
  };

  type FilterKey = 'gender' | 'status' | 'province';

  const toggleFilter = (type: FilterKey, value: string) => {
    setSelectedFilters(prev => ({
      ...prev,
      [type]: prev[type] === value ? '' : value
    }));
  };

  const handlePersonPress = (person: any) => {
    router.push({
      pathname: '/personDetail',
      params: { 
        person: JSON.stringify(person)
      }
    });
  };

  return (
    <View style={styles.wrapper}>
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
            keyboardShouldPersistTaps="handled"
          >
            {/* Header */}
            <View style={styles.header}>
              <View style={styles.headerTitle}>
                <Text style={styles.appName}>Monanji</Text>
                <Text style={styles.screenTitle}>Buscar Pessoas</Text>
              </View>
              <TouchableOpacity 
                style={styles.notificationButton}
                activeOpacity={0.7}
              >
                <Feather name="bell" size={22} color="#1E88E5" />
                <View style={styles.notificationBadge} />
              </TouchableOpacity>
            </View>

            {/* Barra de Busca */}
            <View style={styles.searchContainer}>
              <View style={styles.searchBar}>
                <Feather name="search" size={20} color="#7A8C7D" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Buscar por nome, cidade, idade..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#7A8C7D"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity 
                    onPress={() => setSearchQuery('')}
                    activeOpacity={0.7}
                  >
                    <Feather name="x-circle" size={18} color="#7A8C7D" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Filtros */}
            <View style={styles.filtersSection}>
              <Text style={styles.sectionTitle}>Filtrar por</Text>
              
              {/* Gênero */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Gênero</Text>
                <View style={styles.filterOptions}>
                  {filters.gender.map((filter) => (
                    <TouchableOpacity
                      key={filter.value}
                      style={[
                        styles.filterButton,
                        selectedFilters.gender === filter.value && styles.filterButtonActive
                      ]}
                      onPress={() => toggleFilter('gender', filter.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        selectedFilters.gender === filter.value && styles.filterButtonTextActive
                      ]}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Status */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Status</Text>
                <View style={styles.filterOptions}>
                  {filters.status.map((filter) => (
                    <TouchableOpacity
                      key={filter.value}
                      style={[
                        styles.filterButton,
                        selectedFilters.status === filter.value && styles.filterButtonActive
                      ]}
                      onPress={() => toggleFilter('status', filter.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        selectedFilters.status === filter.value && styles.filterButtonTextActive
                      ]}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Província */}
              <View style={styles.filterGroup}>
                <Text style={styles.filterLabel}>Província</Text>
                <ScrollView 
                  horizontal 
                  showsHorizontalScrollIndicator={false} 
                  style={styles.provinceScroll}
                  contentContainerStyle={styles.provinceScrollContent}
                >
                  {filters.province.map((filter) => (
                    <TouchableOpacity
                      key={filter.value}
                      style={[
                        styles.filterButton,
                        styles.provinceButton,
                        selectedFilters.province === filter.value && styles.filterButtonActive
                      ]}
                      onPress={() => toggleFilter('province', filter.value)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterButtonText,
                        selectedFilters.province === filter.value && styles.filterButtonTextActive
                      ]}>
                        {filter.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>

            {/* Resultados */}
            <View style={styles.resultsSection}>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>
                  {searchResults.length} {searchResults.length === 1 ? 'Caso Encontrado' : 'Casos Encontrados'}
                </Text>
              </View>

              {searchResults.length === 0 ? (
                <View style={styles.emptyState}>
                  <Feather name="search" size={48} color="#7A8C7D" />
                  <Text style={styles.emptyStateTitle}>Nenhum caso encontrado</Text>
                  <Text style={styles.emptyStateText}>
                    Tente ajustar os filtros ou termos da busca
                  </Text>
                </View>
              ) : (
                <View style={styles.resultsList}>
                  {searchResults.map((person) => (
                    <TouchableOpacity
                      key={person.id}
                      style={styles.personCard}
                      onPress={() => handlePersonPress(person)}
                      activeOpacity={0.7}
                    >
                      <Image
                        source={{ uri: person.image }}
                        style={styles.personImage}
                      />
                      <View style={styles.personInfo}>
                        <View style={styles.personHeader}>
                          <Text style={styles.personName} numberOfLines={1}>
                            {person.name}
                          </Text>
                          <View style={[
                            styles.statusIndicator,
                            person.status === 'found' ? styles.foundIndicator : styles.missingIndicator
                          ]} />
                        </View>
                        <View style={styles.infoRow}>
                          <Feather name="map-pin" size={12} color="#7A8C7D" />
                          <Text style={styles.personLocation} numberOfLines={1}>
                            {person.location}
                          </Text>
                        </View>
                        <View style={styles.infoRow}>
                          <Feather name="calendar" size={12} color="#7A8C7D" />
                          <Text style={styles.personDate}>{person.lastSeen}</Text>
                        </View>
                        <Text style={styles.personDescription} numberOfLines={2}>
                          {person.description}
                        </Text>
                      </View>
                      <Feather name="chevron-right" size={20} color="#1E88E5" />
                    </TouchableOpacity>
                  ))}
                </View>
              )}
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
  },
  headerTitle: {
    flex: 1,
  },
  appName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E88E5',
  },
  screenTitle: {
    fontSize: 16,
    color: '#7A8C7D',
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
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 8,
    fontSize: 16,
    color: '#0A0F0D',
  },
  filtersSection: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 15,
  },
  filterGroup: {
    marginBottom: 20,
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0F0D',
    marginBottom: 10,
  },
  filterOptions: {
    flexDirection: 'row',
    gap: 10,
    flexWrap: 'wrap',
  },
  provinceScroll: {
    marginHorizontal: -20,
    paddingHorizontal: 20,
  },
  provinceScrollContent: {
    gap: 10,
    paddingRight: 20,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.2)',
  },
  provinceButton: {
    marginRight: 0,
  },
  filterButtonActive: {
    backgroundColor: '#1E88E5',
    borderColor: '#1E88E5',
  },
  filterButtonText: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '500',
  },
  filterButtonTextActive: {
    color: '#FFFFFF',
  },
  resultsSection: {
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
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
  resultsList: {
    gap: 12,
  },
  personCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.1)',
  },
  personImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
    marginRight: 12,
  },
  personInfo: {
    flex: 1,
    marginRight: 8,
  },
  personHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  personName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0A0F0D',
    marginRight: 8,
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    flexShrink: 0,
  },
  missingIndicator: {
    backgroundColor: '#AF2E24',
  },
  foundIndicator: {
    backgroundColor: '#008C45',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  personLocation: {
    fontSize: 12,
    color: '#7A8C7D',
    marginLeft: 4,
    flex: 1,
  },
  personDate: {
    fontSize: 12,
    color: '#7A8C7D',
    marginLeft: 4,
  },
  personDescription: {
    fontSize: 12,
    color: '#7A8C7D',
    marginTop: 4,
    lineHeight: 16,
  },
});