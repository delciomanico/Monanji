import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { StyleSheet, Text, TouchableOpacity, View, Image, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';

export default function PersonDetailScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  // Converter a string JSON de volta para objeto
  const person = params.person ? JSON.parse(params.person as string) : null;

  const handleInfoPress = () => {
    // Navegar para tela de denúncia
    router.push({
      pathname: '/report',
      params: { personId: person.id }
    });
  };

  if (!person) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Pessoa não encontrada</Text>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Text style={styles.backButtonText}>Voltar</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} >
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
              <Feather name="arrow-left" size={24} color="#ffffff" />
            </TouchableOpacity>
            <Text style={styles.detailTitle}>Detalhes</Text>
            <View style={{ width: 24 }} />
          </View>
          {/* Foto em Destaque */}
          <View style={styles.detailImageContainer}>
            <Image
              source={{ uri: person.image }}
              style={styles.detailImage}
            />
            <View style={[styles.statusBadge,
            person.status === 'found' ? styles.foundBadge : styles.missingBadge
            ]}>
              <Text style={styles.statusBadgeText}>
                {person.status === 'found' ? 'ENCONTRADO' : 'DESAPARECIDO'}
              </Text>
            </View>
          </View>

          {/* Informações Pessoais */}
          <View style={styles.detailSection}>
            <Text style={styles.personName}>{person.name}</Text>
            <Text style={styles.personAge}>{person.age} anos</Text>

            <View style={styles.infoRow}>
              <Feather name="map-pin" size={16} color="#7A8C7D" />
              <Text style={styles.infoText}>{person.location}</Text>
            </View>

            <View style={styles.infoRow}>
              <Feather name="calendar" size={16} color="#7A8C7D" />
              <Text style={styles.infoText}>Visto pela última vez em {person.lastSeen}</Text>
            </View>

            <View style={styles.descriptionBox}>
              <Text style={styles.descriptionTitle}>Descrição Física</Text>
              <Text style={styles.descriptionText}>{person.description}</Text>
            </View>

            {/* Contatos para Informação */}
            <View style={styles.contactsSection}>
              <Text style={styles.sectionTitle}>Contatos para Informação</Text>

              <TouchableOpacity style={styles.contactItem}>
                <View style={styles.contactIcon}>
                  <Feather name="phone" size={18} color="#1E88E5" />
                </View>
                <View>
                  <Text style={styles.contactName}>Polícia Nacional</Text>
                  <Text style={styles.contactNumber}>113 • 222 333 444</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity style={styles.contactItem}>
                <View style={styles.contactIcon}>
                  <Feather name="user" size={18} color="#1E88E5" />
                </View>
                <View>
                  <Text style={styles.contactName}>Família - Sr. Manuel</Text>
                  <Text style={styles.contactNumber}>923 456 789</Text>
                </View>
              </TouchableOpacity>
            </View>

            {/* Botão Tenho Informações */}
            <TouchableOpacity
              style={styles.infoButton}
              onPress={handleInfoPress}
            >
              <LinearGradient
                colors={['#1E88E5', '#1761a2ff']}
                style={styles.infoButtonGradient}
              >
                <Feather name="alert-circle" size={20} color="#FFF" />
                <Text style={styles.infoButtonText}>TENHO INFORMAÇÕES</Text>
              </LinearGradient>
            </TouchableOpacity>
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
    backgroundColor: '#1E88E5',
  },
  backButton: {
    padding: 8,
  },
  detailTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  detailImageContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  detailImage: {
    width: '100%',
    height: 300,
  },
  statusBadge: {
    position: 'absolute',
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  missingBadge: {
    backgroundColor: '#AF2E24',
  },
  foundBadge: {
    backgroundColor: '#008C45',
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  detailSection: {
    paddingHorizontal: 20,
  },
  personName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0A0F0D',
    marginBottom: 4,
  },
  personAge: {
    fontSize: 18,
    color: '#7A8C7D',
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoText: {
    fontSize: 14,
    color: '#7A8C7D',
    marginLeft: 8,
  },
  descriptionBox: {
    backgroundColor: 'rgba(30, 136, 229, 0.05)',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    marginBottom: 25,
  },
  descriptionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0A0F0D',
    marginBottom: 8,
  },
  descriptionText: {
    fontSize: 14,
    color: '#7A8C7D',
    lineHeight: 20,
  },
  contactsSection: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E88E5',
    marginBottom: 15,
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(30, 136, 229, 0.1)',
  },
  contactIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(30, 136, 229, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  contactName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0A0F0D',
    marginBottom: 2,
  },
  contactNumber: {
    fontSize: 14,
    color: '#1E88E5',
    fontWeight: '500',
  },
  infoButton: {
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 30,
  },
  infoButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  infoButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    color: '#7A8C7D',
    marginBottom: 20,
  },
  backButtonText: {
    color: '#1E88E5',
    fontSize: 16,
    fontWeight: '600',
  },
});