import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import { Button, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useTaskStore } from '../../src/store/useTaskStore';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const task = useTaskStore((state) => state.tasks.find((t) => t.id === id));
  const toggleTaskCompleted = useTaskStore((state) => state.toggleTaskCompleted);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const startEditing = useTaskStore((state) => state.startEditing);

  if (!task) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <Stack.Screen options={{ title: 'Tarefa não encontrada' }} />
        <View style={styles.container}>
          <Text style={styles.notFound}>Esta tarefa não existe mais.</Text>
          <Button title="Voltar" onPress={() => router.back()} />
        </View>
      </SafeAreaView>
    );
  }

  const handleEdit = () => {
    startEditing(task.id);
    router.push('/');
  };

  const handleDelete = () => {
    deleteTask(task.id);
    router.back();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <Stack.Screen options={{ title: task.title }} />
      <View style={styles.container}>
        <Text style={styles.label}>Título</Text>
        <Text style={styles.title}>{task.title}</Text>

        <Text style={styles.label}>Status</Text>
        <Text style={[styles.status, task.completed ? styles.statusDone : styles.statusPending]}>
          {task.completed ? '✓ Concluída' : '○ Pendente'}
        </Text>

        <Text style={styles.label}>ID</Text>
        <Text style={styles.idText}>{task.id}</Text>

        <View style={styles.actions}>
          <Button
            title={task.completed ? 'Marcar como pendente' : 'Marcar como concluída'}
            onPress={() => toggleTaskCompleted(task.id)}
          />
          <View style={styles.spacer} />
          <Button title="Editar" onPress={handleEdit} />
          <View style={styles.spacer} />
          <Button title="Excluir" color="#ff4d4d" onPress={handleDelete} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#fff' },
  container: { padding: 16, gap: 8 },
  label: { fontSize: 12, color: '#888', marginTop: 12, textTransform: 'uppercase' },
  title: { fontSize: 22, fontWeight: 'bold' },
  status: { fontSize: 16, fontWeight: 'bold' },
  statusDone: { color: '#43a047' },
  statusPending: { color: '#ff9800' },
  idText: { fontSize: 12, color: '#666', fontFamily: 'monospace' },
  actions: { marginTop: 32 },
  spacer: { height: 12 },
  notFound: { fontSize: 16, color: '#666', marginBottom: 16, textAlign: 'center' },
});
