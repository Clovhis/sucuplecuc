import type { APIRoute } from 'astro';
import { getMovies } from '../../../lib/movies';
import { buildTriviaBank } from '../../../lib/trivia';

export const GET: APIRoute = () => {
	const year = Number(new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'America/Argentina/Buenos_Aires' }).format(new Date()));
	const bank = buildTriviaBank(getMovies(), year);
	if (bank.questions.filter((question) => question.family === 'story').length < 1000) throw new Error('La trivia requiere 1000 historias distintas.');
	if (bank.questions.length < 1000) throw new Error(`La trivia requiere 1000 preguntas; hay ${bank.questions.length}.`);
	// Answers and session selection are served only by authenticated database RPCs.
	return new Response(JSON.stringify({ version: 2, questions: bank.questions.length }), { headers: { 'Content-Type': 'application/json; charset=utf-8' } });
};
