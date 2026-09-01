import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LogOut, ShieldCheck } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme';

export const SecuritySettingsScreen = () => {
 const { logout, keycloakLogout } = useAuth(); const { theme } = useTheme();
 return <View style={[styles.container,{backgroundColor:theme.colors.background}]}><StatusBar barStyle={theme.dark?'light-content':'dark-content'} backgroundColor={theme.colors.background}/><ScrollView contentContainerStyle={styles.content}>
  <Text style={[styles.title,{color:theme.colors.text}]}>Security</Text><Text style={[styles.subtitle,{color:theme.colors.textMuted}]}>Manage your current session and sign out securely.</Text>
  <View style={[styles.info,{backgroundColor:theme.colors.surface,borderColor:theme.colors.border}]}><View style={[styles.icon,{backgroundColor:theme.colors.info+'14'}]}><ShieldCheck size={21} color={theme.colors.info}/></View><View style={styles.infoText}><Text style={[styles.infoTitle,{color:theme.colors.text}]}>Signed-in session</Text><Text style={[styles.infoSubtitle,{color:theme.colors.textMuted}]}>Your account is currently authenticated on this device.</Text></View></View>
  <TouchableOpacity activeOpacity={0.8} onPress={logout} style={[styles.logout,{backgroundColor:theme.colors.error+'0D',borderColor:theme.colors.error+'45'}]}><LogOut size={19} color={theme.colors.error}/><Text style={[styles.logoutText,{color:theme.colors.error}]}>Log out</Text></TouchableOpacity>
  <TouchableOpacity activeOpacity={0.85} onPress={keycloakLogout} style={[styles.full,{backgroundColor:theme.colors.primary}]}><Text style={styles.fullText}>Full browser logout</Text><LogOut size={18} color="#FFF"/></TouchableOpacity>
 </ScrollView></View>;
};
const styles=StyleSheet.create({container:{flex:1},content:{padding:20},title:{fontSize:27,fontWeight:'900',marginBottom:5},subtitle:{fontSize:14,lineHeight:20,marginBottom:22},info:{borderWidth:1,borderRadius:18,padding:16,flexDirection:'row',alignItems:'center',marginBottom:18},icon:{width:44,height:44,borderRadius:14,alignItems:'center',justifyContent:'center',marginRight:13},infoText:{flex:1},infoTitle:{fontSize:16,fontWeight:'800',marginBottom:4},infoSubtitle:{fontSize:13,lineHeight:19},logout:{height:52,borderWidth:1,borderRadius:15,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:9,marginBottom:12},logoutText:{fontSize:15,fontWeight:'800'},full:{height:52,borderRadius:15,flexDirection:'row',alignItems:'center',justifyContent:'center',gap:10},fullText:{fontSize:15,fontWeight:'800',color:'#FFF'}});
