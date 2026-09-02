import React from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Circle, Moon, Smartphone, Sun } from 'lucide-react-native';
import { useTheme } from '../theme';

export const AppearanceSettingsScreen = () => {
  const { theme, themeType, setThemeType } = useTheme();
  const options = [
    { label: 'System', value: 'system' as const, icon: Smartphone },
    { label: 'Light', value: 'light' as const, icon: Sun },
    { label: 'Dark', value: 'dark' as const, icon: Moon },
    { label: 'Black', value: 'black' as const, icon: Circle },
  ];

  return <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
    <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} backgroundColor={theme.colors.background} />
    <ScrollView contentContainerStyle={styles.content}>
      <View style={[styles.card, { backgroundColor: theme.colors.surface }]}>
        {options.map((option, index) => {
          const Icon = option.icon;
          const selected = themeType === option.value;
          return <React.Fragment key={option.value}>
            <TouchableOpacity activeOpacity={0.8} onPress={() => setThemeType(option.value)} style={styles.option}>
              <View style={[styles.icon, { backgroundColor: selected ? theme.colors.primary : theme.colors.surfaceSecondary }]}>
                <Icon size={19} color={selected ? '#FFF' : theme.colors.textSecondary} />
              </View>
              <Text style={[styles.optionText, { color: theme.colors.text }]}>{option.label}</Text>
              <View style={[styles.radio, { borderColor: selected ? theme.colors.primary : theme.colors.border }]}>
                {selected && <View style={[styles.radioDot, { backgroundColor: theme.colors.primary }]} />}
              </View>
            </TouchableOpacity>
            {index < options.length - 1 && <View style={[styles.divider, { backgroundColor: theme.colors.divider }]} />}
          </React.Fragment>;
        })}
      </View>
    </ScrollView>
  </View>;
};

const styles = StyleSheet.create({
  container:{flex:1},
  content:{padding:20},
  card:{borderRadius:18,overflow:'hidden'},
  option:{minHeight:72,flexDirection:'row',alignItems:'center',paddingHorizontal:16},
  icon:{width:42,height:42,borderRadius:13,alignItems:'center',justifyContent:'center',marginRight:13},
  optionText:{flex:1,fontSize:16,fontWeight:'700'},
  radio:{width:22,height:22,borderRadius:11,borderWidth:2,alignItems:'center',justifyContent:'center'},
  radioDot:{width:10,height:10,borderRadius:5},
  divider:{height:1,marginLeft:71},
});
