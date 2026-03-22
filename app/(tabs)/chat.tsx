import React, { useState, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList, TextInput,
  Pressable, KeyboardAvoidingView, Platform,
  ActivityIndicator, Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { AiApi, ChatMessage } from '../../api/ai';

let msgCounter = 0;
const uid = () => `msg_${++msgCounter}_${Date.now()}`;

const WELCOME: ChatMessage = {
  id: uid(),
  role: 'assistant',
  content: 'Привет! Я AI-помощник BeautyGO. Расскажите, какой мастер вам нужен — опишите желаемую услугу, удобное время или район города, и я подберу лучших специалистов. 💄',
  timestamp: new Date(),
};

export default function ChatScreen() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<number | undefined>();
  const listRef = useRef<FlatList>(null);

  const scrollToBottom = useCallback(() => {
    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 100);
  }, []);

  const sendMessage = useCallback(async () => {
    const text = inputText.trim();
    if (!text || isLoading) return;

    const userMsg: ChatMessage = { id: uid(), role: 'user', content: text, timestamp: new Date() };
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsLoading(true);
    scrollToBottom();

    try {
      const res = await AiApi.sendMessage({ message: text, conversation_id: conversationId });
      if (res.conversation_id) setConversationId(res.conversation_id);

      const aiMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: res.reply,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
      scrollToBottom();
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: uid(),
        role: 'assistant',
        content: '⚠️ Не удалось получить ответ. Попробуйте ещё раз.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [inputText, isLoading, conversationId, scrollToBottom]);

  const clearChat = () => {
    Alert.alert('Новый диалог', 'Начать новый диалог?', [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Начать заново',
        onPress: () => {
          setMessages([WELCOME]);
          setConversationId(undefined);
        },
      },
    ]);
  };

  const renderMessage = ({ item }: { item: ChatMessage }) => {
    const isUser = item.role === 'user';
    return (
      <View style={[styles.messageRow, isUser ? styles.messageRowUser : styles.messageRowAi]}>
        {!isUser && (
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>✨</Text>
          </View>
        )}
        <View style={[styles.bubble, isUser ? styles.bubbleUser : styles.bubbleAi]}>
          <Text style={[styles.bubbleText, isUser ? styles.bubbleTextUser : styles.bubbleTextAi]}>
            {item.content}
          </Text>
          <Text style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString('ru', { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 88 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.headerIcon}>
            <Text style={styles.headerIconText}>✨</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>AI-помощник</Text>
            <Text style={styles.headerSubtitle}>Подберу мастера для вас</Text>
          </View>
        </View>
        <Pressable onPress={clearChat} style={styles.newChatBtn}>
          <Ionicons name="add-circle-outline" size={24} color="#3E3A59" />
        </Pressable>
      </View>

      {/* Messages */}
      <FlatList
        ref={listRef}
        data={messages}
        keyExtractor={(item) => item.id}
        renderItem={renderMessage}
        contentContainerStyle={styles.messagesList}
        onContentSizeChange={scrollToBottom}
      />

      {/* Typing indicator */}
      {isLoading && (
        <View style={styles.typingRow}>
          <View style={styles.aiAvatar}>
            <Text style={styles.aiAvatarText}>✨</Text>
          </View>
          <View style={styles.typingBubble}>
            <ActivityIndicator size="small" color="#3E3A59" />
            <Text style={styles.typingText}>печатает...</Text>
          </View>
        </View>
      )}

      {/* Quick prompts */}
      {messages.length === 1 && (
        <View style={styles.quickPrompts}>
          {['Маникюр рядом со мной', 'Массаж завтра вечером', 'Стрижка в эти выходные'].map((prompt) => (
            <Pressable
              key={prompt}
              style={styles.quickPrompt}
              onPress={() => { setInputText(prompt); }}
            >
              <Text style={styles.quickPromptText}>{prompt}</Text>
            </Pressable>
          ))}
        </View>
      )}

      {/* Input */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Напишите что вы ищете..."
          placeholderTextColor="#aaa"
          multiline
          maxLength={500}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
          editable={!isLoading}
        />
        <Pressable
          style={[styles.sendBtn, (!inputText.trim() || isLoading) && styles.sendBtnDisabled]}
          onPress={sendMessage}
          disabled={!inputText.trim() || isLoading}
        >
          <Ionicons name="send" size={20} color={inputText.trim() && !isLoading ? '#3E3A59' : '#bbb'} />
        </Pressable>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F0F4F7' },

  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: '#fff', paddingHorizontal: 16, paddingVertical: 12,
    borderBottomWidth: 1, borderBottomColor: '#E0E0E0',
  },
  headerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  headerIcon: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F8E1E7', justifyContent: 'center', alignItems: 'center',
  },
  headerIconText: { fontSize: 20 },
  headerTitle: { fontSize: 16, fontWeight: '700', color: '#3E3A59' },
  headerSubtitle: { fontSize: 12, color: '#999', marginTop: 1 },
  newChatBtn: { padding: 4 },

  messagesList: { padding: 16, gap: 12, paddingBottom: 8 },

  messageRow: { flexDirection: 'row', alignItems: 'flex-end', gap: 8 },
  messageRowUser: { justifyContent: 'flex-end' },
  messageRowAi: { justifyContent: 'flex-start' },

  aiAvatar: {
    width: 32, height: 32, borderRadius: 16,
    backgroundColor: '#F8E1E7', justifyContent: 'center',
    alignItems: 'center', flexShrink: 0,
  },
  aiAvatarText: { fontSize: 16 },

  bubble: { maxWidth: '78%', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10 },
  bubbleUser: { backgroundColor: '#3E3A59', borderBottomRightRadius: 4 },
  bubbleAi: { backgroundColor: '#fff', borderBottomLeftRadius: 4, elevation: 1, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, shadowOffset: { width: 0, height: 1 } },

  bubbleText: { fontSize: 15, lineHeight: 21 },
  bubbleTextUser: { color: '#fff' },
  bubbleTextAi: { color: '#2D2D2D' },

  timestamp: { fontSize: 10, color: '#bbb', marginTop: 4, alignSelf: 'flex-end' },

  typingRow: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    paddingHorizontal: 16, paddingBottom: 4,
  },
  typingBubble: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: '#fff', borderRadius: 18, paddingHorizontal: 14, paddingVertical: 10,
  },
  typingText: { fontSize: 13, color: '#999' },

  quickPrompts: {
    flexDirection: 'row', flexWrap: 'wrap', gap: 8,
    paddingHorizontal: 16, paddingBottom: 8,
  },
  quickPrompt: {
    backgroundColor: '#fff', borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
    borderWidth: 1, borderColor: '#E0E0E0',
  },
  quickPromptText: { fontSize: 13, color: '#3E3A59' },

  inputBar: {
    flexDirection: 'row', alignItems: 'flex-end', gap: 8,
    backgroundColor: '#fff', paddingHorizontal: 12, paddingVertical: 10,
    borderTopWidth: 1, borderTopColor: '#E0E0E0',
  },
  input: {
    flex: 1, backgroundColor: '#F5F5F5', borderRadius: 20,
    paddingHorizontal: 16, paddingVertical: 10,
    fontSize: 15, color: '#2D2D2D', maxHeight: 100,
  },
  sendBtn: {
    width: 40, height: 40, borderRadius: 20,
    backgroundColor: '#F8E1E7', justifyContent: 'center', alignItems: 'center',
  },
  sendBtnDisabled: { backgroundColor: '#F0F0F0' },
});
