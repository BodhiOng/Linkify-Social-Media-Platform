import request from 'supertest';
import { expect } from 'chai';
import app from '../src/app.mjs'; // Assuming your Express app is exported from this file

describe('Post Routes', () => {
    let token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2NmQyYzk2MTk2OWJmYTAyZGFmMGM2NTEiLCJpYXQiOjE3MjUxNzYwOTgsImV4cCI6MTcyNTE3OTY5OH0.aUYGrZRQNt6fGRUtScnc8nQDoRS3kH9KUMwUKH5XPPQ'; // You might want to get a valid token before tests

    it('should create a new post', async () => {
        const res = await request(app)
            .post('/api/posts')
            .set('Authorization', `Bearer ${token}`)
            .field('content', 'Test content')
            .attach('image', "test\Bodhi formal picture.jpg"); // path to test image file

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property('content', 'Test content');
    });

    it('should get all posts', async () => {
        const res = await request(app).get('/api/posts');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should get posts by username', async () => {
        const res = await request(app).get('/api/posts/test-username');

        expect(res.status).to.equal(200);
        expect(res.body).to.be.an('array');
    });

    it('should update a post', async () => {
        const res = await request(app)
            .put('/api/posts/test-post-id')
            .set('Authorization', `Bearer ${token}`)
            .send({ content: 'Updated content' });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('content', 'Updated content');
    });

    it('should delete a post', async () => {
        const res = await request(app)
            .delete('/api/posts/test-post-id')
            .set('Authorization', `Bearer ${token}`);

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property('message', 'Post deleted');
    });
});