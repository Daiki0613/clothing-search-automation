"use client"

import { useState, useEffect, useRef } from "react"

const GAME_HEIGHT = 150
const GAME_WIDTH = 600
const DINO_WIDTH = 40
const DINO_HEIGHT = 43
const CACTUS_WIDTH = 30
const CACTUS_HEIGHT = 50
const GROUND_HEIGHT = 20

export default function ChromeDinoGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [gameStarted, setGameStarted] = useState(false)
  const [score, setScore] = useState(0)
  const [highScore, setHighScore] = useState(0)

  const dinoRef = useRef({
    x: 50,
    y: GAME_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT,
    dy: 0,
    jumping: false,
  })

  const cactusRef = useRef({
    x: GAME_WIDTH,
    y: GAME_HEIGHT - CACTUS_HEIGHT - GROUND_HEIGHT,
  })

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas?.getContext("2d")
    if (!canvas || !ctx) return

    let animationFrameId: number

    const jump = () => {
      if (!dinoRef.current.jumping) {
        dinoRef.current.dy = -10
        dinoRef.current.jumping = true
      }
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === "Space") {
        e.preventDefault()
        if (!gameStarted) {
          setGameStarted(true)
        } else {
          jump()
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown)

    const update = () => {
      if (!gameStarted) return

      // Update dino position
      dinoRef.current.y += dinoRef.current.dy
      if (dinoRef.current.y < GAME_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT) {
        dinoRef.current.dy += 0.6 // Gravity
      } else {
        dinoRef.current.y = GAME_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT
        dinoRef.current.jumping = false
      }

      // Update cactus position
      cactusRef.current.x -= 5
      if (cactusRef.current.x < -CACTUS_WIDTH) {
        cactusRef.current.x = GAME_WIDTH
        setScore((prevScore) => prevScore + 1)
      }

      // Check collision
      if (
        dinoRef.current.x < cactusRef.current.x + CACTUS_WIDTH &&
        dinoRef.current.x + DINO_WIDTH > cactusRef.current.x &&
        dinoRef.current.y < cactusRef.current.y + CACTUS_HEIGHT &&
        dinoRef.current.y + DINO_HEIGHT > cactusRef.current.y
      ) {
        setGameStarted(false)
        setHighScore((prevHighScore) => Math.max(prevHighScore, score))
        setScore(0)
        dinoRef.current = { x: 50, y: GAME_HEIGHT - DINO_HEIGHT - GROUND_HEIGHT, dy: 0, jumping: false }
        cactusRef.current = { x: GAME_WIDTH, y: GAME_HEIGHT - CACTUS_HEIGHT - GROUND_HEIGHT }
      }
    }

    const draw = () => {
      ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

      // Draw ground
      ctx.fillStyle = "#000000"
      ctx.fillRect(0, GAME_HEIGHT - GROUND_HEIGHT, GAME_WIDTH, GROUND_HEIGHT)

      // Draw dino
      ctx.fillStyle = "#000000"
      ctx.fillRect(dinoRef.current.x, dinoRef.current.y, DINO_WIDTH, DINO_HEIGHT)

      // Draw cactus
      ctx.fillStyle = "#000000"
      ctx.fillRect(cactusRef.current.x, cactusRef.current.y, CACTUS_WIDTH, CACTUS_HEIGHT)

      // Draw score
      ctx.fillStyle = "#000000"
      ctx.font = "20px Arial"
      ctx.fillText(`Score: ${score}`, 10, 30)
      ctx.fillText(`High Score: ${highScore}`, 10, 60)

      if (!gameStarted) {
        ctx.fillStyle = "#000000"
        ctx.font = "20px Arial"
        ctx.fillText("Press Space to start/jump", GAME_WIDTH / 2 - 100, GAME_HEIGHT / 2)
      }
    }

    const gameLoop = () => {
      update()
      draw()
      animationFrameId = requestAnimationFrame(gameLoop)
    }

    gameLoop()

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
      cancelAnimationFrame(animationFrameId)
    }
  }, [gameStarted, score, highScore]) // Added highScore to dependencies

  return (
    <div className="mt-4">
      <canvas ref={canvasRef} width={GAME_WIDTH} height={GAME_HEIGHT} className="border border-gray-300 rounded" />
    </div>
  )
}

