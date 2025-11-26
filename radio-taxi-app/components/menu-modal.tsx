import React from 'react';
import { Modal, TouchableOpacity, View, Text, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface MenuModalProps {
  visible: boolean;
  onClose: () => void;
  onLogout: () => void;
}

export function MenuModal({ visible, onClose, onLogout }: MenuModalProps) {
  const inputBg = useThemeColor({ light: '#fff', dark: '#1e1f20' }, 'background');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorder = useThemeColor({ light: '#ccc', dark: '#333' }, 'background');

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.menuOverlay} activeOpacity={1} onPress={onClose}>
        <View style={[styles.menuDrawer, { backgroundColor: inputBg }]}>
          <TouchableOpacity
            style={[styles.menuItem, { borderBottomColor: inputBorder }]}
            onPress={() => {
              onClose();
              onLogout();
            }}
          >
            <Text style={[styles.menuItemText, { color: inputTextColor }]}>Logout</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  menuOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-start',
  },
  menuDrawer: {
    width: 250,
    height: '100%',
    paddingTop: 60,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
  },
  menuItemText: {
    fontSize: 16,
    fontWeight: '500',
  },
});
