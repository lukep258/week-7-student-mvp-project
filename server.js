import express from 'express'
import cors from 'cors'
import pg from 'pg'

const app = express()
const port = process.env.port