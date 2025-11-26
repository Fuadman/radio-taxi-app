import React from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { useThemeColor } from '@/hooks/use-theme-color';

interface RouteModalProps {
  visible: boolean;
  onClose: () => void;
  tempDestinationText: string;
  setTempDestinationText: (text: string) => void;
  onSubmit: (address: string) => void;
  onOpenMapPicker: () => void;
}

export function RouteModal({
  visible,
  onClose,
  tempDestinationText,
  setTempDestinationText,
  onSubmit,
  onOpenMapPicker,
}: RouteModalProps) {
  const inputBg = useThemeColor({ light: '#fff', dark: '#1e1f20' }, 'background');
  const inputTextColor = useThemeColor({}, 'text');
  const inputBorder = useThemeColor({ light: '#ccc', dark: '#333' }, 'background');
  const placeholderColor = useThemeColor({ light: '#666', dark: '#9a9a9a' }, 'text');

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.routeModalContainer}>
        <View style={[styles.routeModalContent, { backgroundColor: inputBg }]}>
          <View style={styles.routeModalHeader}>
            <Text style={[styles.routeModalTitle, { color: inputTextColor }]}>Enter your route</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Text style={{ fontSize: 24, color: inputTextColor }}>×</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={[
              styles.input,
              { backgroundColor: inputBg, color: inputTextColor, borderColor: inputBorder, margin: 12 },
            ]}
            placeholder="To"
            placeholderTextColor={placeholderColor}
            value={tempDestinationText}
            onChangeText={setTempDestinationText}
            autoFocus
            onSubmitEditing={() => onSubmit(tempDestinationText)}
            returnKeyType="done"
          />

          <TouchableOpacity style={styles.mapPickerButton} onPress={onOpenMapPicker}>
            <Text style={styles.mapPickerButtonText}>Choose on the map</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  routeModalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  routeModalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 40,
    minHeight: 300,
  },
  routeModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  routeModalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 8,
    borderRadius: 4,
  },
  mapPickerButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    marginHorizontal: 12,
    marginTop: 12,
    alignItems: 'center',
  },
  mapPickerButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
