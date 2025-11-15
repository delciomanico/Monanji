import { LinearGradient } from 'expo-linear-gradient';
import { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated, Easing } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';


export default function LoadingScreen() {
    const router = useRouter();
    const spinValue = useRef(new Animated.Value(0)).current;

    // Animação do spinner
    useEffect(() => {
        const spinAnimation = Animated.loop(
            Animated.timing(spinValue, {
                toValue: 1,
                duration: 1500,
                easing: Easing.linear,
                useNativeDriver: true,
            })
        );
        spinAnimation.start();

        // Processar por 5 segundos e depois navegar
        const timer = setTimeout(async () => {
            try {

                router.replace('/(tabs)');

            } catch (error) {
                console.log('Error checking onboarding status:', error);
                // Em caso de erro, ir para a home
                router.replace('/(tabs)');
            }
        }, 7000); // 5 segundos

        return () => {
            spinAnimation.stop();
            clearTimeout(timer);
        };
    }, []);

    // Interpolação da rotação
    const spin = spinValue.interpolate({
        inputRange: [0, 1],
        outputRange: ['0deg', '360deg'],
    });

    return (
        <SafeAreaView style={styles.container}>
           

            {/* Overlay escuro */}
            <View style={styles.overlay} />

            {/* Gradiente sutil */}
            <LinearGradient
                colors={['rgba(30, 136, 229, 0.3)', 'rgba(10, 15, 13, 0.7)']}
                style={styles.gradient}
            />

            {/* Conteúdo principal */}
            <View style={styles.content}>
                {/* Logo/Ícone do app */}
                <View style={styles.logoContainer}>
                    <View style={styles.logo}>

                        <Image
                            source={require('../../assets/images/policial2.png')}
                            resizeMode='cover'
                            style={{ width: 120, height: 120 }}
                        />

                    </View>
                </View>
                {/* Nome do app */}
                <Text style={styles.appName}>Monanji</Text>

                {/* Frase curta */}
                <Text style={styles.tagline}>
                    "Eu sou porque nós somos"
                </Text>

                {/* Spinner de carregamento */}
                <View style={styles.spinnerContainer}>
                    <Animated.View style={[styles.spinner, { transform: [{ rotate: spin }] }]}>
                        <View style={styles.spinnerInner} />
                    </Animated.View>
                    <Text style={styles.loadingText}>Carregando...</Text>
                </View>

                {/* Texto de processamento */}
                <View style={styles.processingContainer}>
                    <Text style={styles.processingText}>
                        Preparando sua experiência
                    </Text>
                    <View style={styles.dotsContainer}>
                        <Animated.Text style={[styles.dot, styles.dot1]}>.</Animated.Text>
                        <Animated.Text style={[styles.dot, styles.dot2]}>.</Animated.Text>
                        <Animated.Text style={[styles.dot, styles.dot3]}>.</Animated.Text>
                    </View>
                </View>
            </View>

            {/* Rodapé */}
            <View style={styles.footer}>
                <Text style={styles.footerText}>
                    Reunindo famílias, construindo esperanças
                </Text>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#1E88E5',
    },
    backgroundImage: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.8,
    },
    overlay: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(10, 15, 13, 0.6)',
    },
    gradient: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        opacity: 0.5,
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    logoContainer: {
        marginBottom: 30,
    },
    logo: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.3)',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 4,
        },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 6,
    },
    logoIcon: {
        fontSize: 40,
    },
    appName: {
        fontSize: 42,
        fontWeight: 'bold',
        color: '#FFFFFF',
        textAlign: 'center',
        marginBottom: 12,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 2, height: 2 },
        textShadowRadius: 10,
    },
    tagline: {
        fontSize: 18,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        fontStyle: 'italic',
        marginBottom: 60,
        textShadowColor: 'rgba(0, 0, 0, 0.5)',
        textShadowOffset: { width: 1, height: 1 },
        textShadowRadius: 5,
    },
    spinnerContainer: {
        alignItems: 'center',
        marginBottom: 40,
    },
    spinner: {
        width: 60,
        height: 60,
        borderRadius: 30,
        borderWidth: 3,
        borderColor: 'rgba(255, 255, 255, 0.2)',
        borderTopColor: '#FFFFFF',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 16,
    },
    spinnerInner: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    loadingText: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.8)',
        fontWeight: '500',
    },
    processingContainer: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    processingText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.7)',
        marginRight: 4,
    },
    dotsContainer: {
        flexDirection: 'row',
    },
    dot: {
        fontSize: 20,
        color: '#FFFFFF',
        fontWeight: 'bold',
    },
    dot1: {
        opacity: 0.6,
    },
    dot2: {
        opacity: 0.8,
    },
    dot3: {
        opacity: 1,
    },
    footer: {
        position: 'absolute',
        bottom: 40,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: 40,
    },
    footerText: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.6)',
        textAlign: 'center',
        fontStyle: 'italic',
    },
});