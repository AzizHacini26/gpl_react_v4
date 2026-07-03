package com.gplsp.service;

import com.gplsp.entity.CompanyInfoT;
import com.gplsp.entity.UserT;
import com.gplsp.repository.CompanyInfoR;
import com.gplsp.repository.UserR;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
public class CompanyInfoS {

    private final CompanyInfoR companyInfoR;
    private final UserR userR;
    private final AuditLogS auditLogS;

    public CompanyInfoS(CompanyInfoR companyInfoR, UserR userR, AuditLogS auditLogS) {
        this.companyInfoR = companyInfoR;
        this.userR = userR;
        this.auditLogS = auditLogS;
    }

    public List<CompanyInfoT> getAll() {
        return companyInfoR.findAll();
    }

    public List<CompanyInfoT> getAllForUser(String username) {
        return companyInfoR.findOwnedByUsername(username)
                .map(List::of)
                .orElse(Collections.emptyList());
    }

    public Optional<CompanyInfoT> getById(Integer id) {
        return companyInfoR.findById(id);
    }

    public CompanyInfoT create(CompanyInfoT companyInfo) {
        return create(companyInfo, null);
    }

    public CompanyInfoT create(CompanyInfoT companyInfo, MultipartFile logo) {
        try {
            if (logo != null && !logo.isEmpty()) {
                companyInfo.setLogo(logo.getBytes());
                companyInfo.setLogoContentType(logo.getContentType());
            }
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
        CompanyInfoT saved = companyInfoR.save(companyInfo);
        auditLogS.log("company_info", saved.getId(), "CREATE", null, saved,
                "Created company info '" + saved.getCompanyName() + "'");
        return saved;
    }

    @Transactional
    public CompanyInfoT createForUser(String username, CompanyInfoT companyInfo, MultipartFile logo) throws IOException {
        UserT user = userR.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        if (user.getCompanyInfoT() != null) {
            throw new IllegalStateException("Company info already exists for this user");
        }

        CompanyInfoT savedCompanyInfo = create(companyInfo, logo);
        user.setCompanyInfoT(savedCompanyInfo);
        userR.save(user);
        return savedCompanyInfo;
    }

    public Optional<CompanyInfoT> update(Integer id, CompanyInfoT companyInfoInput) {
        return companyInfoR.findById(id).map(existing -> {
            CompanyInfoT old = copyCompanyInfo(existing);
            existing.setCompanyName(companyInfoInput.getCompanyName());
            existing.setAdminName(companyInfoInput.getAdminName());
            existing.setAgrement(companyInfoInput.getAgrement());
            existing.setAdresse(companyInfoInput.getAdresse());
            existing.setWilaya(companyInfoInput.getWilaya());
            existing.setSubwilaya(companyInfoInput.getSubwilaya());
            existing.setWilayaArabic(companyInfoInput.getWilayaArabic());
            existing.setPhone1(companyInfoInput.getPhone1());
            existing.setPhone2(companyInfoInput.getPhone2());
            existing.setEmail(companyInfoInput.getEmail());
            existing.setPhonesEmail(companyInfoInput.getPhonesEmail());
            existing.setCardAgriment(companyInfoInput.getCardAgriment());
            existing.setCardAnnee(companyInfoInput.getCardAnnee());
            existing.setLogoContentType(companyInfoInput.getLogoContentType());
            existing.setLogo(companyInfoInput.getLogo());
            CompanyInfoT saved = companyInfoR.save(existing);
            auditLogS.log("company_info", saved.getId(), "UPDATE", old, saved,
                    "Updated company info '" + saved.getCompanyName() + "'");
            return saved;
        });
    }

    @Transactional
    public Optional<CompanyInfoT> updateForUser(String username, Integer id, CompanyInfoT companyInfoInput)
            throws IOException {
        UserT user = userR.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getCompanyInfoT() == null || !id.equals(user.getCompanyInfoT().getId())) {
            throw new AccessDeniedException("You can only update your own company info");
        }
        return update(id, companyInfoInput);
    }

    public Optional<CompanyInfoT> update(Integer id, CompanyInfoT companyInfoInput, MultipartFile logo) throws IOException {
        return companyInfoR.findById(id).map(existing -> {
            CompanyInfoT old = copyCompanyInfo(existing);
            existing.setCompanyName(companyInfoInput.getCompanyName());
            existing.setAdminName(companyInfoInput.getAdminName());
            existing.setAgrement(companyInfoInput.getAgrement());
            existing.setAdresse(companyInfoInput.getAdresse());
            existing.setWilaya(companyInfoInput.getWilaya());
            existing.setSubwilaya(companyInfoInput.getSubwilaya());
            existing.setWilayaArabic(companyInfoInput.getWilayaArabic());
            existing.setPhone1(companyInfoInput.getPhone1());
            existing.setPhone2(companyInfoInput.getPhone2());
            existing.setEmail(companyInfoInput.getEmail());
            existing.setPhonesEmail(companyInfoInput.getPhonesEmail());
            existing.setCardAgriment(companyInfoInput.getCardAgriment());
            existing.setCardAnnee(companyInfoInput.getCardAnnee());
            if (logo != null && !logo.isEmpty()) {
                try {
                    existing.setLogo(logo.getBytes());
                    existing.setLogoContentType(logo.getContentType());
                } catch (IOException e) {
                    throw new RuntimeException(e);
                }
            }
            CompanyInfoT saved = companyInfoR.save(existing);
            auditLogS.log("company_info", saved.getId(), "UPDATE", old, saved,
                    "Updated company info '" + saved.getCompanyName() + "'");
            return saved;
        });
    }

    @Transactional
    public Optional<CompanyInfoT> updateForUser(String username, Integer id, CompanyInfoT companyInfoInput, MultipartFile logo)
            throws IOException {
        UserT user = userR.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        if (user.getCompanyInfoT() == null || !id.equals(user.getCompanyInfoT().getId())) {
            throw new AccessDeniedException("You can only update your own company info");
        }
        return update(id, companyInfoInput, logo);
    }

    public boolean delete(Integer id) {
        Optional<CompanyInfoT> existing = companyInfoR.findById(id);
        if (existing.isEmpty()) {
            return false;
        }
        CompanyInfoT ci = existing.get();
        companyInfoR.deleteById(id);
        auditLogS.log("company_info", id, "DELETE", ci, null,
                "Deleted company info '" + ci.getCompanyName() + "'");
        return true;
    }

    private CompanyInfoT copyCompanyInfo(CompanyInfoT src) {
        CompanyInfoT c = new CompanyInfoT();
        c.setId(src.getId());
        c.setCompanyName(src.getCompanyName());
        c.setAdminName(src.getAdminName());
        c.setAgrement(src.getAgrement());
        c.setAdresse(src.getAdresse());
        c.setWilaya(src.getWilaya());
        c.setSubwilaya(src.getSubwilaya());
        c.setWilayaArabic(src.getWilayaArabic());
        c.setPhone1(src.getPhone1());
        c.setPhone2(src.getPhone2());
        c.setEmail(src.getEmail());
        c.setPhonesEmail(src.getPhonesEmail());
        c.setCardAgriment(src.getCardAgriment());
        c.setCardAnnee(src.getCardAnnee());
        return c;
    }
}
