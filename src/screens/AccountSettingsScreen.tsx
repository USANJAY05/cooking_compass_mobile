import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { Mail, KeyRound, Fingerprint } from 'lucide-react-native';
import { useAuth } from '../auth/AuthContext';
import { useTheme } from '../theme';

export const AccountSettingsScreen = () => {
 const { user } = useAuth(); const { theme } = useTheme();
 const items = [
  { label:'Display name', value:user?.name || 'Not provided', icon:Fingerprint, color:theme.colors.primary },
  { label:'Username', value:user?.username || 'Not provided', icon:KeyRound, color:theme.colors.green },
  { label:'Email address', value:user?.email || 'Not provided', icon:Mail, color:theme.colors.orange },
  { label:'Account ID', value:user?.id || 'Not available', icon:Fingerprint, color:theme.colors.info },
 ];
 return <View style={[styles.container,{backgroundColor:theme.colors.background}]}><StatusBar barStyle={theme.dark?'light-content':'dark-content'} backgroundColor={theme.colors.background}/><ScrollView contentContainerStyle={styles.content}>
  <Text style={[styles.title,{color:theme.colors.text}]}>Account information</Text><Text style={[styles.subtitle,{color:theme.colors.textMuted}]}>Your profile details from your signed-in account.</Text>
  <View style={[styles.card,{backgroundColor:theme.colors.surface,borderColor:theme.colors.border}]}>{items.map((item,index)=>{const Icon=item.icon;return <React.Fragment key={item.label}><View style={styles.row}><View style={[styles.icon,{backgroundColor:item.color+'14'}]}><Icon size={19} color={item.color}/></View><View style={styles.text}><Text style={[styles.label,{color:theme.colors.textMuted}]}>{item.label}</Text><Text style={[styles.value,{color:theme.colors.text}]} numberOfLines={2}>{item.value}</Text></View></View>{index<items.length-1&&<View style={[styles.divider,{backgroundColor:theme.colors.divider}]}/>}</React.Fragment>})}</View>
 </ScrollView></View>;
};
const styles=StyleSheet.create({container:{flex:1},content:{padding:20},title:{fontSize:27,fontWeight:'900',marginBottom:5},subtitle:{fontSize:14,lineHeight:20,marginBottom:22},card:{borderRadius:18,borderWidth:1,overflow:'hidden'},row:{minHeight:82,flexDirection:'row',alignItems:'center',paddingHorizontal:16,paddingVertical:12},icon:{width:42,height:42,borderRadius:13,alignItems:'center',justifyContent:'center',marginRight:13},text:{flex:1},label:{fontSize:12,fontWeight:'700',marginBottom:4},value:{fontSize:16,fontWeight:'800'},divider:{height:1,marginLeft:71}});
