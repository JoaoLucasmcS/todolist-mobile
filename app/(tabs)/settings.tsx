import { useState } from 'react';
import { Button, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AboutScreen from '../../src/components/AboutScreen';
import { useTaskStore, type TaskFilter } from '../../src/store/useTaskStore';
import { useAuthStore } from '../../src/store/useAuthStore';
import { useRouter } from 'expo-router';

const FILTERS: { label: string; value: TaskFilter }[] = [
  { label: 'Todas', value: 'all' },
  { label: 'Concluídas', value: 'completed' },
  { label: 'Pendentes', value: 'pending' },
];

export default function SettingsScreen() {
  const tasks = useTaskStore((state) => state.tasks);
  const filter = useTaskStore((state) => state.filter);
  const setFilter = useTaskStore((state) => state.setFilter);
  const deleteAllTasks = useTaskStore((state) => state.deleteAllTasks);
  const user = useAuthStore((state) => state.user);
  const clearSession = useAuthStore((state) => state.clearSession);
  const router = useRouter();

  const [aboutVisible, setAboutVisible] = useState(false);

  const handleLogout = () => {
    clearSession();
    router.replace('/login');
  };

  const completedCount = tasks.filter((t) => t.completed).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.heading}>Configurações</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Estatísticas</Text>
          <Text style={styles.statLine}>Total: {tasks.length}</Text>
          <Text style={styles.statLine}>Concluídas: {completedCount}</Text>
          <Text style={styles.statLine}>Pendentes: {tasks.length - completedCount}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Filtro padrão</Text>
          <View style={styles.filterRow}>
            {FILTERS.map(({ label, value }) => {
              const active = filter === value;
              return (
                <View key={value} style={styles.filterChipWrapper}>
                  <Button title={active ? `✓ ${label}` : label} onPress={() => setFilter(value)} />
                </View>
              );
            })}
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Ações</Text>
          <View style={styles.buttonSpacer}>
            <Button title="Sobre o App" onPress={() => setAboutVisible(true)} />
          </View>
          <View style={styles.buttonSpacer}>
            <Button title="Excluir todas as tarefas" color="#ff4d4d" onPress={deleteAllTasks} />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Conta</Text>
          {user && (
            <Text style={styles.statLine}>
              {user.name ? `${user.name} ` : ''}({user.email})
            </Text>
          )}
          <View style={styles.buttonSpacer}>
            <Button title="Sair" color="#ff4d4d" onPress={handleLogout} />
          </View>
        </View>
      </ScrollView>

      <Modal visible={aboutVisible} animationType="slide" onRequestClose={() => setAboutVisible(false)}>
        <AboutScreen onClose={() => setAboutVisible(false)} />
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, gap: 24 },
  heading: { fontSize: 24, fontWeight: 'bold' },
  section: { gap: 8 },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#333' },
  statLine: { fontSize: 14, color: '#555' },
  filterRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  filterChipWrapper: { minWidth: 100 },
  buttonSpacer: { marginTop: 8 },
});
