// src/screens/LoginScreen.js
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, StatusBar, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { loginUser } from '../services/authService';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation }) {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleLogin = async () => {
        try {
            if (!email || !password) {
                Alert.alert("Warning", "Please fill in all fields");
                return;
            }
            setLoading(true);
            await loginUser(email, password);
        } catch (error) {
            Alert.alert("Login Failed", error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <StatusBar barStyle="light-content" backgroundColor="#6C63FF" />
            <LinearGradient
                colors={['#6C63FF', '#8B5CF6']}
                style={styles.upperBg}
            />

            <View style={styles.contentContainer}>
                <View style={styles.header}>
                    <Text style={styles.title}>Fitness Pro</Text>
                    <Text style={styles.subtitle}>Welcome Back</Text>
                </View>

                <View style={styles.formContainer}>
                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your email"
                            placeholderTextColor="#aaa"
                            value={email}
                            onChangeText={setEmail}
                            autoCapitalize="none"
                            keyboardType="email-address"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Password</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="Enter your password"
                            placeholderTextColor="#aaa"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity style={styles.forgotPass}>
                        <Text style={styles.forgotText}>Forgot Password?</Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={loading}>
                        <LinearGradient
                            colors={['#6C63FF', '#4834d4']}
                            style={styles.gradientBtn}
                            start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                        >
                            <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Don't have an account? </Text>
                        <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                            <Text style={styles.link}>Sign Up</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f0f2f5' },
    upperBg: {
        height: '40%',
        width: '100%',
        position: 'absolute',
        top: 0,
        borderBottomLeftRadius: 60,
    },
    contentContainer: {
        flex: 1,
        justifyContent: 'center',
        paddingHorizontal: 24,
    },
    header: {
        marginBottom: 40,
        marginTop: 60,
    },
    title: {
        fontSize: 40,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 18,
        color: 'rgba(255,255,255,0.8)',
        marginTop: 5,
    },
    formContainer: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 24,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
        elevation: 10,
    },
    inputGroup: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
        marginLeft: 4
    },
    input: {
        height: 52,
        backgroundColor: '#F7F8FA',
        borderRadius: 12,
        paddingHorizontal: 16,
        fontSize: 16,
        color: '#333',
        borderWidth: 1,
        borderColor: '#EAEAEA'
    },
    forgotPass: {
        alignSelf: 'flex-end',
        marginBottom: 24,
    },
    forgotText: {
        color: '#6C63FF',
        fontSize: 14,
        fontWeight: '500',
    },
    button: {
        borderRadius: 16,
        overflow: 'hidden',
        marginBottom: 20,
        shadowColor: "#6C63FF",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 5,
    },
    gradientBtn: {
        paddingVertical: 16,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontWeight: 'bold',
        fontSize: 18,
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        marginTop: 10,
    },
    footerText: {
        color: '#888',
        fontSize: 14,
    },
    link: {
        color: '#6C63FF',
        fontWeight: 'bold',
        fontSize: 14,
    },
});
