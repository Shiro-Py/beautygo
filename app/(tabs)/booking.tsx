import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  Pressable, ActivityIndicator, Alert,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SpecialistsApi } from '../../api/specialists';
import { AppointmentsApi } from '../../api/appointments';
import { Specialist, Service, TimeSlot } from '../../api/constants';

type Step = 'service' | 'slot' | 'confirm' | 'success';

// Следующие 7 дней в формате YYYY-MM-DD
function getNextDays(count = 7): { label: string; value: string }[] {
  const days = [];
  const dayNames = ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const value = d.toISOString().split('T')[0];
    const label = i === 0 ? 'Сегодня' : i === 1 ? 'Завтра' : `${dayNames[d.getDay()]} ${d.getDate()}`;
    days.push({ label, value });
  }
  return days;
}

export default function BookingScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [specialist, setSpecialist] = useState<Specialist | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [slots, setSlots] = useState<TimeSlot[]>([]);
  const [isLoadingInit, setIsLoadingInit] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [step, setStep] = useState<Step>('service');
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);

  const days = getNextDays(7);

  // Загрузка специалиста и услуг
  useEffect(() => {
    if (!id) return;
    Promise.all([
      SpecialistsApi.getById(id),
      SpecialistsApi.getServices(id).catch(() => [] as Service[]),
    ])
      .then(([s, svc]) => { setSpecialist(s); setServices(svc); })
      .catch(() => Alert.alert('Ошибка', 'Не удалось загрузить данные мастера'))
      .finally(() => setIsLoadingInit(false));
  }, [id]);

  // Загрузка слотов при выборе даты
  const loadSlots = useCallback(async (date: string) => {
    if (!id) return;
    setIsLoadingSlots(true);
    setSelectedSlot(null);
    try {
      const data = await SpecialistsApi.getSlots(id, date);
      setSlots(Array.isArray(data) ? data : []);
    } catch {
      setSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  }, [id]);

  useEffect(() => {
    if (step === 'slot') loadSlots(selectedDate);
  }, [step, selectedDate, loadSlots]);

  const handleConfirm = async () => {
    if (!specialist || !selectedService || !selectedSlot) return;
    setIsSubmitting(true);
    try {
      await AppointmentsApi.create({
        specialist: specialist.id,
        service: selectedService.id,
        slot: selectedSlot.id,
      });
      setStep('success');
    } catch (err: any) {
      Alert.alert('Ошибка', err?.getUserMessage?.() ?? 'Не удалось создать запись. Попробуйте ещё раз.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoadingInit) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3E3A59" />
      </View>
    );
  }

  // ─── SUCCESS ────────────────────────────────────────────────────────────────
  if (step === 'success') {
    return (
      <View style={styles.successScreen}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.successTitle}>Запись подтверждена!</Text>
        <Text style={styles.successText}>
          {specialist?.full_name} · {selectedService?.name}{'\n'}
          {selectedDate} в {selectedSlot?.time}
        </Text>
        <Pressable style={styles.primaryBtn} onPress={() => router.replace('/(tabs)/masters')}>
          <Text style={styles.primaryBtnText}>На главную</Text>
        </Pressable>
      </View>
    );
  }

  const availableSlots = slots.filter((s) => s.is_available);

  return (
    <ScrollView style={styles.screen} contentContainerStyle={styles.content}>
      {/* Хедер */}
      <Pressable style={styles.backRow} onPress={() => step === 'service' ? router.back() : setStep(step === 'confirm' ? 'slot' : 'service')}>
        <Ionicons name="arrow-back" size={20} color="#3E3A59" />
        <Text style={styles.backText}>Назад</Text>
      </Pressable>

      {/* Мастер */}
      {specialist && (
        <View style={styles.masterCard}>
          <View style={styles.masterAvatar}>
            <Text style={styles.masterAvatarText}>{specialist.full_name?.[0] ?? '?'}</Text>
          </View>
          <View>
            <Text style={styles.masterName}>{specialist.full_name}</Text>
            <Text style={styles.masterMeta}>★ {parseFloat(specialist.rating).toFixed(1)} · {specialist.city}</Text>
          </View>
        </View>
      )}

      {/* Прогресс */}
      <View style={styles.steps}>
        {(['service', 'slot', 'confirm'] as Step[]).map((s, i) => (
          <View key={s} style={styles.stepItem}>
            <View style={[styles.stepDot, step === s && styles.stepDotActive, (step === 'slot' && i === 0) || (step === 'confirm' && i < 2) ? styles.stepDotDone : null]}>
              <Text style={[styles.stepDotText, step === s && styles.stepDotTextActive]}>{i + 1}</Text>
            </View>
            <Text style={[styles.stepLabel, step === s && styles.stepLabelActive]}>
              {s === 'service' ? 'Услуга' : s === 'slot' ? 'Время' : 'Подтверждение'}
            </Text>
            {i < 2 && <View style={[styles.stepLine, (step === 'slot' && i === 0) || (step === 'confirm' && i < 2) ? styles.stepLineDone : null]} />}
          </View>
        ))}
      </View>

      {/* ─── ШАГ 1: ВЫБОР УСЛУГИ ─── */}
      {step === 'service' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Выберите услугу</Text>
          {services.length === 0 ? (
            <Text style={styles.emptyText}>Услуги не найдены</Text>
          ) : (
            services.map((svc) => (
              <Pressable
                key={svc.id}
                style={[styles.serviceCard, selectedService?.id === svc.id && styles.serviceCardSelected]}
                onPress={() => setSelectedService(svc)}
              >
                <View style={styles.serviceInfo}>
                  <Text style={[styles.serviceName, selectedService?.id === svc.id && styles.serviceNameSelected]}>
                    {svc.name}
                  </Text>
                  <Text style={styles.serviceDuration}>{svc.duration_minutes} мин</Text>
                </View>
                <Text style={[styles.servicePrice, selectedService?.id === svc.id && styles.servicePriceSelected]}>
                  {svc.price} ₽
                </Text>
                {selectedService?.id === svc.id && (
                  <Ionicons name="checkmark-circle" size={22} color="#3E3A59" style={{ marginLeft: 8 }} />
                )}
              </Pressable>
            ))
          )}
          <Pressable
            style={[styles.primaryBtn, !selectedService && styles.primaryBtnDisabled]}
            disabled={!selectedService}
            onPress={() => setStep('slot')}
          >
            <Text style={styles.primaryBtnText}>Выбрать время →</Text>
          </Pressable>
        </View>
      )}

      {/* ─── ШАГ 2: ВЫБОР ВРЕМЕНИ ─── */}
      {step === 'slot' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Выберите дату</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daysRow}>
            {days.map((d) => (
              <Pressable
                key={d.value}
                style={[styles.dayBtn, selectedDate === d.value && styles.dayBtnSelected]}
                onPress={() => setSelectedDate(d.value)}
              >
                <Text style={[styles.dayBtnText, selectedDate === d.value && styles.dayBtnTextSelected]}>
                  {d.label}
                </Text>
              </Pressable>
            ))}
          </ScrollView>

          <Text style={[styles.sectionTitle, { marginTop: 20 }]}>Доступное время</Text>
          {isLoadingSlots ? (
            <ActivityIndicator color="#3E3A59" style={{ marginVertical: 20 }} />
          ) : availableSlots.length === 0 ? (
            <Text style={styles.emptyText}>Нет свободных слотов на эту дату</Text>
          ) : (
            <View style={styles.slotsGrid}>
              {availableSlots.map((slot) => (
                <Pressable
                  key={slot.id}
                  style={[styles.slotBtn, selectedSlot?.id === slot.id && styles.slotBtnSelected]}
                  onPress={() => setSelectedSlot(slot)}
                >
                  <Text style={[styles.slotBtnText, selectedSlot?.id === slot.id && styles.slotBtnTextSelected]}>
                    {slot.time}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}

          <Pressable
            style={[styles.primaryBtn, !selectedSlot && styles.primaryBtnDisabled, { marginTop: 24 }]}
            disabled={!selectedSlot}
            onPress={() => setStep('confirm')}
          >
            <Text style={styles.primaryBtnText}>Подтвердить →</Text>
          </Pressable>
        </View>
      )}

      {/* ─── ШАГ 3: ПОДТВЕРЖДЕНИЕ ─── */}
      {step === 'confirm' && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Проверьте запись</Text>

          <View style={styles.summaryCard}>
            <SummaryRow icon="person" label="Мастер" value={specialist?.full_name ?? '—'} />
            <SummaryRow icon="cut" label="Услуга" value={selectedService?.name ?? '—'} />
            <SummaryRow icon="time" label="Дата и время" value={`${selectedDate} в ${selectedSlot?.time}`} />
            <SummaryRow icon="cash" label="Стоимость" value={`${selectedService?.price} ₽`} />
            <SummaryRow icon="hourglass" label="Длительность" value={`${selectedService?.duration_minutes} мин`} />
          </View>

          <Pressable
            style={[styles.primaryBtn, isSubmitting && styles.primaryBtnDisabled, { marginTop: 24 }]}
            onPress={handleConfirm}
            disabled={isSubmitting}
          >
            {isSubmitting
              ? <ActivityIndicator color="#3E3A59" />
              : <Text style={styles.primaryBtnText}>Записаться</Text>}
          </Pressable>
        </View>
      )}
    </ScrollView>
  );
}

function SummaryRow({ icon, label, value }: { icon: any; label: string; value: string }) {
  return (
    <View style={styles.summaryRow}>
      <Ionicons name={icon} size={18} color="#777" />
      <Text style={styles.summaryLabel}>{label}</Text>
      <Text style={styles.summaryValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F0F4F7' },
  content: { padding: 16, paddingBottom: 40 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  backRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 16 },
  backText: { fontSize: 16, color: '#3E3A59', fontWeight: '500' },

  masterCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: '#fff', borderRadius: 14, padding: 14, marginBottom: 20,
  },
  masterAvatar: {
    width: 48, height: 48, borderRadius: 24,
    backgroundColor: '#F8E1E7', justifyContent: 'center', alignItems: 'center',
  },
  masterAvatarText: { fontSize: 20, fontWeight: '600', color: '#3E3A59' },
  masterName: { fontSize: 16, fontWeight: '700', color: '#3E3A59' },
  masterMeta: { fontSize: 13, color: '#777', marginTop: 2 },

  steps: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  stepItem: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  stepDot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: '#E0E0E0', justifyContent: 'center', alignItems: 'center',
  },
  stepDotActive: { backgroundColor: '#3E3A59' },
  stepDotDone: { backgroundColor: '#F8E1E7', borderWidth: 1, borderColor: '#3E3A59' },
  stepDotText: { fontSize: 13, fontWeight: '700', color: '#aaa' },
  stepDotTextActive: { color: '#fff' },
  stepLabel: { fontSize: 11, color: '#aaa', marginLeft: 4 },
  stepLabelActive: { color: '#3E3A59', fontWeight: '600' },
  stepLine: { flex: 1, height: 2, backgroundColor: '#E0E0E0', marginHorizontal: 4 },
  stepLineDone: { backgroundColor: '#F8E1E7' },

  section: { gap: 12 },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: '#3E3A59' },

  serviceCard: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#fff', borderRadius: 12, padding: 14,
    borderWidth: 2, borderColor: 'transparent',
  },
  serviceCardSelected: { borderColor: '#3E3A59', backgroundColor: '#F8F4FF' },
  serviceInfo: { flex: 1 },
  serviceName: { fontSize: 15, fontWeight: '600', color: '#3E3A59' },
  serviceNameSelected: { color: '#3E3A59' },
  serviceDuration: { fontSize: 12, color: '#999', marginTop: 2 },
  servicePrice: { fontSize: 15, fontWeight: '700', color: '#3E3A59' },
  servicePriceSelected: { color: '#3E3A59' },

  daysRow: { marginVertical: 8 },
  dayBtn: {
    paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, backgroundColor: '#fff',
    marginRight: 8, borderWidth: 1.5, borderColor: 'transparent',
  },
  dayBtnSelected: { borderColor: '#3E3A59', backgroundColor: '#F8F4FF' },
  dayBtnText: { fontSize: 14, color: '#555', fontWeight: '500' },
  dayBtnTextSelected: { color: '#3E3A59', fontWeight: '700' },

  slotsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10 },
  slotBtn: {
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 10, backgroundColor: '#fff',
    borderWidth: 1.5, borderColor: 'transparent',
  },
  slotBtnSelected: { borderColor: '#3E3A59', backgroundColor: '#F8F4FF' },
  slotBtnText: { fontSize: 15, color: '#3E3A59', fontWeight: '500' },
  slotBtnTextSelected: { fontWeight: '700' },

  summaryCard: {
    backgroundColor: '#fff', borderRadius: 14, padding: 16, gap: 14,
  },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  summaryLabel: { fontSize: 14, color: '#777', width: 110 },
  summaryValue: { fontSize: 15, color: '#3E3A59', fontWeight: '600', flex: 1 },

  primaryBtn: {
    backgroundColor: '#F8E1E7', paddingVertical: 16,
    borderRadius: 14, alignItems: 'center',
  },
  primaryBtnDisabled: { opacity: 0.45 },
  primaryBtnText: { color: '#3E3A59', fontSize: 17, fontWeight: '600' },
  emptyText: { color: '#999', fontSize: 15, textAlign: 'center', marginVertical: 16 },

  successScreen: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: '#fff', padding: 32, gap: 16,
  },
  successEmoji: { fontSize: 64 },
  successTitle: { fontSize: 24, fontWeight: '700', color: '#3E3A59' },
  successText: { fontSize: 15, color: '#777', textAlign: 'center', lineHeight: 22 },
});
