import { useEffect, useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  Platform,
  StatusBar as RNStatusBar,
  Image,
  Pressable,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Checkbox from 'expo-checkbox';
import DateTimePicker from '@react-native-community/datetimepicker';
import TaskList from '../../src/components/TaskList';
import { globalStyles } from '../../src/styles/global';
import { useTaskStore } from '../../src/store/useTaskStore';

export default function TasksScreen() {
  const totalCount = useTaskStore((state) => state.tasks.length);
  const addTask = useTaskStore((state) => state.addTask);
  const updateTask = useTaskStore((state) => state.updateTask);
  const filter = useTaskStore((state) => state.filter);
  const setFilter = useTaskStore((state) => state.setFilter);
  const editingTaskId = useTaskStore((state) => state.editingTaskId);
  const startEditing = useTaskStore((state) => state.startEditing);

  const [text, setText] = useState('');
  const [logoError, setLogoError] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [priority, setPriority] = useState<'Baixa' | 'Média' | 'Alta'>('Baixa');

  const isUpdating = editingTaskId !== null;

  useEffect(() => {
    if (editingTaskId) {
      const task = useTaskStore.getState().tasks.find((t) => t.id === editingTaskId);
      if (task) {
        setText(task.title);
        setCompleted(task.completed);
        setDueDate(null);
        setModalVisible(true);
      }
    }
  }, [editingTaskId]);

  const resetForm = () => {
    setText('');
    setCompleted(false);
    setDueDate(null);
    setPriority('Baixa');
    setModalVisible(false);
    startEditing(null);
  };

  const handleSave = () => {
    if (!text.trim()) return;
    if (isUpdating && editingTaskId) {
      updateTask(editingTaskId, text, completed);
    } else {
      addTask(text, completed);
    }
    resetForm();
  };

  const onChangeDate = (_event: unknown, selectedDate?: Date) => {
    setShowDatePicker(false);
    if (selectedDate) setDueDate(selectedDate);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.headerContainer}>
          {logoError ? (
            <Text style={styles.header}>Gerenciador de Tarefas</Text>
          ) : (
            <Image
              source={require('../../assets/task-app-banner.png')}
              style={styles.logo}
              onError={() => setLogoError(true)}
            />
          )}
          {!logoError && <Text style={styles.header}>Tarefas</Text>}
        </View>

        <View style={styles.counterContainer}>
          <Text style={styles.counterText}>Total de Tarefas: {totalCount}</Text>
        </View>

        <View style={styles.filterContainer}>
          {(['all', 'completed', 'pending'] as const).map((value) => {
            const labelMap = { all: 'Todas', completed: 'Concluídas', pending: 'Pendentes' };
            const active = filter === value;
            return (
              <TouchableOpacity
                key={value}
                style={[styles.filterButton, active ? styles.filterButtonActive : styles.filterButtonInactive]}
                onPress={() => setFilter(value)}
              >
                <Text style={active ? styles.filterTextActive : styles.filterTextInactive}>{labelMap[value]}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.actionButtonsContainer}>
          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              styles.actionButtonAdd,
              pressed && styles.actionButtonAddPressed,
            ]}
            onPress={() => setModalVisible(true)}
          >
            <Text style={styles.actionButtonText}>Nova Tarefa</Text>
          </Pressable>
        </View>

        <TaskList />
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={resetForm}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{isUpdating ? 'Editar Tarefa' : 'Nova Tarefa'}</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="Nome da tarefa..."
              value={text}
              maxLength={50}
              onChangeText={setText}
            />

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Data limite:</Text>
              {Platform.OS === 'web' ? (
                // @ts-ignore
                <input
                  type="date"
                  value={dueDate ? dueDate.toISOString().split('T')[0] : ''}
                  onChange={(e: any) => {
                    const val = e.target.value;
                    if (val) {
                      const parts = val.split('-');
                      setDueDate(new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2])));
                    } else {
                      setDueDate(null);
                    }
                  }}
                  style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', flex: 1, marginLeft: 16 }}
                />
              ) : (
                <View style={{ flex: 1, marginLeft: 16, alignItems: 'flex-start' }}>
                  <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePickerBtn}>
                    <Text>{dueDate ? dueDate.toLocaleDateString() : 'Selecionar Data'}</Text>
                  </TouchableOpacity>
                  {showDatePicker && (
                    <DateTimePicker
                      value={dueDate || new Date()}
                      mode="date"
                      display="default"
                      onChange={onChangeDate}
                    />
                  )}
                </View>
              )}
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Concluída:</Text>
              <View style={styles.checkboxContainer}>
                <Checkbox value={completed} onValueChange={setCompleted} color={completed ? '#000' : undefined} />
              </View>
            </View>

            <View style={styles.fieldRow}>
              <Text style={styles.fieldLabel}>Prioridade:</Text>
              <View style={styles.priorityContainer}>
                {(['Baixa', 'Média', 'Alta'] as const).map((p) => (
                  <TouchableOpacity
                    key={p}
                    style={[
                      styles.priorityButton,
                      priority === p && {
                        backgroundColor: p === 'Baixa' ? '#4caf50' : p === 'Média' ? '#ff9800' : '#f44336',
                        borderColor: p === 'Baixa' ? '#4caf50' : p === 'Média' ? '#ff9800' : '#f44336',
                      },
                    ]}
                    onPress={() => setPriority(p)}
                  >
                    <Text style={[styles.priorityText, priority === p && styles.priorityTextActive]}>{p}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancelBtn} onPress={resetForm}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalSaveBtn, !text.trim() && styles.modalSaveBtnDisabled]}
                onPress={handleSave}
                disabled={!text.trim()}
              >
                <Text style={styles.modalSaveText}>Salvar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: globalStyles.backgroundColor,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  container: { flex: 1, maxWidth: 600, width: '100%', alignSelf: 'center', paddingHorizontal: 16 },
  headerContainer: { alignItems: 'center', marginTop: 16 },
  logo: { width: 60, height: 60, marginBottom: 8 },
  header: { textAlign: 'center', fontSize: 24, fontWeight: 'bold' },
  counterContainer: { marginTop: 8, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  counterText: { fontSize: globalStyles.bodyFontSize, color: '#666' },
  filterContainer: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginTop: 12 },
  filterButton: { paddingVertical: 6, paddingHorizontal: 12, borderRadius: 16, borderWidth: 1 },
  filterButtonActive: { backgroundColor: '#000', borderColor: '#000' },
  filterButtonInactive: { backgroundColor: 'transparent', borderColor: '#000' },
  filterTextActive: { color: '#fff', fontSize: 14, fontWeight: 'bold' },
  filterTextInactive: { color: '#000', fontSize: 14 },
  actionButtonsContainer: { flexDirection: 'row', justifyContent: 'center', gap: 16, marginTop: 16 },
  actionButton: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 3,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    flex: 1,
  },
  actionButtonText: { color: '#fff', fontWeight: 'bold', fontSize: 14, letterSpacing: 0.5 },
  actionButtonAdd: { backgroundColor: globalStyles.primaryColor, shadowColor: globalStyles.primaryColor },
  actionButtonAddPressed: {
    backgroundColor: '#333',
    transform: [{ scale: 0.98 }],
    elevation: 1,
    shadowOpacity: 0.1,
  },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center' },
  modalContent: {
    width: '90%',
    maxWidth: 400,
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 24,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16, textAlign: 'center' },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    paddingVertical: 10,
    paddingHorizontal: 12,
    fontSize: 16,
    marginBottom: 16,
  },
  fieldRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  fieldLabel: { fontSize: 16, fontWeight: 'bold' },
  checkboxContainer: { marginLeft: 16 },
  priorityContainer: { flexDirection: 'row', flex: 1, marginLeft: 16, gap: 8, flexWrap: 'wrap' },
  priorityButton: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 4, borderWidth: 1, borderColor: '#ccc' },
  priorityText: { color: '#333' },
  priorityTextActive: { color: '#fff', fontWeight: 'bold' },
  datePickerBtn: { borderWidth: 1, borderColor: '#ccc', paddingVertical: 8, paddingHorizontal: 12, borderRadius: 4 },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
  modalCancelBtn: { paddingVertical: 10, paddingHorizontal: 16 },
  modalCancelText: { color: '#666', fontSize: 16, fontWeight: 'bold' },
  modalSaveBtn: { backgroundColor: '#000', paddingVertical: 10, paddingHorizontal: 20, borderRadius: 4 },
  modalSaveBtnDisabled: { backgroundColor: '#ccc' },
  modalSaveText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
