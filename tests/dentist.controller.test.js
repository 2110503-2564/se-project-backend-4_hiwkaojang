const mongoose = require("mongoose");
const {
  updateDentistReview,
  removeDentistReview,
} = require("../controllers/dentists");
const Dentist = require("../models/Dentist");

// Mock the Dentist model
jest.mock("../models/Dentist");

describe("Dentist Review Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: { id: "fakeDentistId" },
      user: { id: "fakeUserId" },
      body: {
        rating: 4,
        review: "Great service!",
      },
    };

    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };

    next = jest.fn();

    // Clear mocks
    Dentist.findByIdAndUpdate.mockClear();
  });

  describe("updateDentistReview", () => {
    it("should remove existing review and add a new one", async () => {
      // Mock Dentist.findByIdAndUpdate for both pull and push
      Dentist.findByIdAndUpdate
        .mockResolvedValueOnce({}) // For $pull
        .mockResolvedValueOnce({ _id: "fakeDentistId", rating: [] }); // For $push

      await updateDentistReview(req, res, next);

      expect(Dentist.findByIdAndUpdate).toHaveBeenCalledTimes(2);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        sucess: true,
        data: { _id: "fakeDentistId", rating: [] },
      });
    });

    it("should return 400 if dentist not found after update", async () => {
      Dentist.findByIdAndUpdate
        .mockResolvedValueOnce({}) // $pull
        .mockResolvedValueOnce(null); // $push returns null

      await updateDentistReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ sucess: false });
    });

    it("should handle errors", async () => {
      Dentist.findByIdAndUpdate.mockRejectedValue(
        new Error("Something went wrong")
      );

      await updateDentistReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ sucess: false });
    });
  });

  describe("removeDentistReview", () => {
    it("should remove a review by user ID", async () => {
      Dentist.findByIdAndUpdate.mockResolvedValue({
        _id: "fakeDentistId",
        rating: [],
      });

      await removeDentistReview(req, res, next);

      expect(Dentist.findByIdAndUpdate).toHaveBeenCalledWith(
        req.params.id,
        {
          $pull: {
            rating: {
              user: req.user.id,
            },
          },
        },
        {
          new: true,
          runValidators: true,
        }
      );

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        sucess: true,
        data: { _id: "fakeDentistId", rating: [] },
      });
    });

    it("should return 400 if dentist not found", async () => {
      Dentist.findByIdAndUpdate.mockResolvedValue(null);

      await removeDentistReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ sucess: false });
    });

    it("should handle errors", async () => {
      Dentist.findByIdAndUpdate.mockRejectedValue(new Error("DB error"));

      await removeDentistReview(req, res, next);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ sucess: false });
    });
  });
});
