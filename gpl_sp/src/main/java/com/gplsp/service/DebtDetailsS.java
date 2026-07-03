package com.gplsp.service;

import com.gplsp.entity.ClientT;
import com.gplsp.entity.DebtDetailsDto;
import com.gplsp.entity.DebtDetailsTable;
import com.gplsp.repository.ClientR;
import com.gplsp.repository.DebtDetailsR;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class DebtDetailsS {

    private final DebtDetailsR debtDetailsR;
    private final ClientR clientR;
    private final AuditLogS auditLogS;

    public DebtDetailsS(DebtDetailsR debtDetailsR, ClientR clientR, AuditLogS auditLogS) {
        this.debtDetailsR = debtDetailsR;
        this.clientR = clientR;
        this.auditLogS = auditLogS;
    }

    public List<DebtDetailsDto> getAll() {
        return debtDetailsR.findAll().stream()
                .map(this::toDto)
                .collect(Collectors.toList());
    }

    public Optional<DebtDetailsDto> getById(Integer id) {
        return debtDetailsR.findById(id).map(this::toDto);
    }

    public DebtDetailsDto create(DebtDetailsDto debtDetailsDto) {
        DebtDetailsTable saved = debtDetailsR.save(toEntity(debtDetailsDto, new DebtDetailsTable()));
        String clientName = saved.getCustomer() != null ? saved.getCustomer() : "";
        auditLogS.log("debt", saved.getId(), "CREATE", null, saved,
                "Created debt of " + saved.getAmount() + " for " + clientName);
        return toDto(saved);
    }

    public Optional<DebtDetailsDto> update(Integer id, DebtDetailsDto debtDetailsDto) {
        return debtDetailsR.findById(id)
                .map(existing -> {
                    DebtDetailsTable old = new DebtDetailsTable();
                    old.setId(existing.getId());
                    old.setPrixx(existing.getPrixx());
                    old.setProd(existing.getProd());
                    old.setTypewasl(existing.getTypewasl());
                    old.setDateInsert(existing.getDateInsert());
                    old.setCustomer(existing.getCustomer());
                    old.setPhone(existing.getPhone());
                    old.setAmount(existing.getAmount());
                    old.setStatus(existing.getStatus());
                    old.setClientT(existing.getClientT());

                    DebtDetailsTable saved = debtDetailsR.save(toEntity(debtDetailsDto, existing));
                    auditLogS.log("debt", saved.getId(), "UPDATE", old, saved,
                            "Updated debt " + saved.getId() + " (" + saved.getAmount() + ")");
                    return toDto(saved);
                });
    }

    public boolean delete(Integer id) {
        Optional<DebtDetailsTable> existing = debtDetailsR.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        DebtDetailsTable debt = existing.get();
        debtDetailsR.deleteById(id);
        auditLogS.log("debt", id, "DELETE", debt, null,
                "Deleted debt " + id + " (" + debt.getAmount() + ")");
        return true;
    }

    private DebtDetailsDto toDto(DebtDetailsTable entity) {
        DebtDetailsDto dto = new DebtDetailsDto();
        dto.setId(entity.getId());
        if (entity.getClientT() != null) {
            dto.setClientId(entity.getClientT().getId());
            dto.setClientName(entity.getClientT().getName());
        }
        dto.setPhone(entity.getPhone());
        dto.setAmount(entity.getAmount());
        dto.setStatus(entity.getStatus());
        dto.setDateInsert(entity.getDateInsert());
        return dto;
    }

    private DebtDetailsTable toEntity(DebtDetailsDto dto, DebtDetailsTable entity) {
        if (dto.getClientId() != null) {
            ClientT client = clientR.findById(dto.getClientId())
                    .orElseThrow(() -> new IllegalArgumentException("Client not found"));
            entity.setClientT(client);
            entity.setCustomer(client.getName());
        } else {
            entity.setClientT(null);
            entity.setCustomer(null);
        }

        entity.setPhone(dto.getPhone());
        entity.setAmount(dto.getAmount());
        entity.setStatus(dto.getStatus());
        entity.setDateInsert(dto.getDateInsert());
        return entity;
    }
}
