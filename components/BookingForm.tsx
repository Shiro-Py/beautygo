import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable, TextInput } from 'react-native';

export default function BookingForm() {
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');

  const handleSubmit = () => {
    console.log(`Запись на ${date} в ${time}`);
    alert(`Вы записались на ${date} в ${time}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Дата</Text>
      <TextInput
        style={styles.input}
        placeholder="например: 2025-04-20"
        value={date}
        onChangeText={setDate}
      />

      <Text style={styles.label}>Время</Text>
      <TextInput
        style={styles.input}
        placeholder="например: 14:00"
        value={time}
        onChangeText={setTime}
      />

      <Pressable style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Подтвердить запись</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    gap: 16,
  },
  label: {
    fontSize: 16,
    color: '#3E3A59',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 12,
    padding: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: '#F8E1E7',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#3E3A59',
    fontSize: 16,
    fontWeight: '600',
  },
});