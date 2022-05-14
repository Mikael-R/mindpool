import { createContext, useContext, useEffect, useState } from 'react'

import Router from 'next/router'

import QuestionsRepository from 'repositories/questionsRepository'

import type { ReactNode } from 'react'
import type { Question } from 'types/entities'

type Questions = Question[]
type QuestionsAnswers = { id: string; answer: number }[]
type AnswerQuestion = (questionId: string, answer: number) => void

interface AuthContextData {
  questions: Questions
  questionsAnswers: QuestionsAnswers
  isLoading: boolean
  answerQuestion: AnswerQuestion
}

interface AuthProviderProps {
  children: ReactNode
}

const questionsRepository = new QuestionsRepository()

const QuestionsContext = createContext<AuthContextData>({
  questions: [],
  questionsAnswers: [],
  isLoading: true,
  answerQuestion: () => undefined
})

export const QuestionsProvider = ({ children }: AuthProviderProps) => {
  const [questions, setQuestions] = useState<Questions>([])
  const [questionsAnswers, setQuestionsAnswers] = useState<QuestionsAnswers>([])
  const [isLoading, setIsLoading] = useState(true)

  const answerQuestion: AnswerQuestion = (questionId, answer) => {
    setQuestionsAnswers([
      ...questionsAnswers.filter(({ id }) => id !== questionId),
      {
        id: questionId,
        answer
      }
    ])
  }

  const fetchQuestions = async () => {
    try {
      const { questions } = await questionsRepository.getQuestions()
      setQuestions(questions)
    } catch {
      Router.push('/')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchQuestions()
  }, [])

  return (
    <QuestionsContext.Provider
      value={{
        questions,
        questionsAnswers,
        isLoading,
        answerQuestion
      }}
    >
      {children}
    </QuestionsContext.Provider>
  )
}

export const useQuestions = () => {
  const context = useContext(QuestionsContext)

  return context
}