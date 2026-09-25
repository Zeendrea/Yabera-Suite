package com.yaberasuite.service;

import com.yaberasuite.domain.BlockedDate;
import com.yaberasuite.dto.BlockDateRequest;
import com.yaberasuite.dto.BlockedDateResponse;
import com.yaberasuite.exception.ApiException;
import com.yaberasuite.exception.DatesUnavailableException;
import com.yaberasuite.repo.BlockedDateRepository;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class BlockedDateService {

    private final BlockedDateRepository blockedDateRepository;
    private final OccupancyService occupancyService;

    public BlockedDateService(BlockedDateRepository blockedDateRepository, OccupancyService occupancyService) {
        this.blockedDateRepository = blockedDateRepository;
        this.occupancyService = occupancyService;
    }

    @Transactional(readOnly = true)
    public List<BlockedDateResponse> list() {
        return blockedDateRepository.findAllByOrderByStartDateAsc().stream().map(this::toResponse).toList();
    }

    @Transactional
    public BlockedDateResponse block(BlockDateRequest request) {
        LocalDate start = request.startDate();
        LocalDate end = request.endDate();
        if (end.isBefore(start)) {
            throw new ApiException("Block end date must be on or after the start date.");
        }
        if (occupancyService.isRangeOccupiedInclusive(start, end)) {
            throw new DatesUnavailableException("Those dates overlap an existing booking or block.");
        }

        BlockedDate blocked = new BlockedDate();
        blocked.setStartDate(start);
        blocked.setEndDate(end);
        blocked.setReason(request.reason() == null || request.reason().isBlank() ? "Unavailable" : request.reason().trim());
        blocked = blockedDateRepository.saveAndFlush(blocked);

        try {
            occupancyService.occupyBlock(blocked.getId(), start, end);
        } catch (DataIntegrityViolationException ex) {
            throw new DatesUnavailableException("Those dates overlap an existing booking or block.");
        }
        return toResponse(blocked);
    }

    @Transactional
    public void unblock(Long id) {
        BlockedDate blocked = blockedDateRepository.findById(id)
                .orElseThrow(() -> new ApiException("Blocked range not found."));
        occupancyService.releaseBlock(id);
        blockedDateRepository.delete(blocked);
    }

    private BlockedDateResponse toResponse(BlockedDate blocked) {
        return new BlockedDateResponse(
                blocked.getId(),
                blocked.getStartDate(),
                blocked.getEndDate(),
                blocked.getReason(),
                blocked.getCreatedAt()
        );
    }
}
